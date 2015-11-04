// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package io.v.android.apps.reader;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.common.io.ByteStreams;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import io.v.android.apps.reader.db.DB;
import io.v.android.apps.reader.db.DB.DBList;
import io.v.android.apps.reader.model.DeviceInfoFactory;
import io.v.android.apps.reader.model.IdFactory;
import io.v.android.apps.reader.model.Listener;
import io.v.android.apps.reader.vdl.DeviceMeta;
import io.v.android.apps.reader.vdl.DeviceSet;
import io.v.android.apps.reader.vdl.File;

/**
 * Activity that shows the contents of the selected pdf file.
 */
public class PdfViewerActivity extends Activity {

    private static final String TAG = PdfViewerActivity.class.getSimpleName();

    private static final String EXTRA_DEVICE_SET_ID = "device_set_id";

    private PdfViewWrapper mPdfView;
    private Button mButtonPrev;
    private Button mButtonNext;

    private DB mDB;
    private DBList<DeviceSet> mDeviceSets;
    private DeviceSet mCurrentDS;

    /**
     * Helper methods for creating an intent to start a PdfViewerActivity.
     */
    public static Intent createIntent(Context context, String deviceSetId) {
        Intent intent = new Intent(context, PdfViewerActivity.class);
        intent.putExtra(EXTRA_DEVICE_SET_ID, deviceSetId);
        return intent;
    }

    public static Intent createIntent(Context context, Uri uri) {
        Intent intent = new Intent(context, PdfViewerActivity.class);
        intent.setData(uri);
        return intent;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize the DB
        mDB = DB.Singleton.get(this);
        mDB.init(this);

        setContentView(R.layout.activity_pdf_viewer);

        mPdfView = (PdfViewWrapper) findViewById(R.id.pdfview);

        mButtonPrev = (Button) findViewById(R.id.button_prev);
        mButtonNext = (Button) findViewById(R.id.button_next);

        mButtonPrev.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                prevPage();
            }
        });

        mButtonNext.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                nextPage();
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();

        mDeviceSets = mDB.getDeviceSetList();
        mDeviceSets.setListener(new Listener() {
            @Override
            public void notifyItemChanged(int position) {
                if (mCurrentDS == null) {
                    return;
                }

                DeviceSet changed = mDeviceSets.getItem(position);
                if (!changed.getId().equals(mCurrentDS.getId())) {
                    return;
                }

                mCurrentDS = changed;
                mPdfView.setPage(getDeviceMeta().getPage());
            }

            @Override
            public void notifyItemInserted(int position) {
                // Nothing to do
            }

            @Override
            public void notifyItemRemoved(int position) {
                // Nothing to do
            }
        });

        Intent intent = getIntent();

        if (intent.hasExtra(EXTRA_DEVICE_SET_ID)) {
            /**
             * Case #1.
             * The EXTRA_DEVICE_SET_ID value is set when this activity is started by touching one of
             * the existing device sets from the DeviceSetChooserActivity.
             */

            // Get the device set from the DB and join it.
            DeviceSet ds = mDeviceSets.getItemById(intent.getStringExtra(EXTRA_DEVICE_SET_ID));
            joinDeviceSet(ds);
        } else if (intent.getData() != null) {
            /**
             * Case #2.
             * The intent.getData() is set as a content Uri when this activity is started by using
             * the floating action button from the DeviceSetChooserActivity and selecting one of the
             * local PDF files from the browser.
             */
            // Get the file content.
            java.io.File jFile = getFileFromUri(intent.getData());
            if (jFile == null) {
                Log.e(TAG, "Could not get the file content of Uri: " + intent.getData().toString());
                return;
            }

            // Create a vdl File object representing this pdf file and put it in the db.
            File vFile = createVdlFile(jFile, intent.getData());
            mDB.addFile(vFile);

            // Create a device set object and put it in the db.
            DeviceSet ds = createDeviceSet(vFile);
            mDB.addDeviceSet(ds);

            // Join the device set.
            joinDeviceSet(ds);
        }
    }

    @Override
    protected void onStop() {
        super.onStop();

        if (mDeviceSets != null) {
            mDeviceSets.discard();
        }

        leaveDeviceSet();
    }

    private File createVdlFile(java.io.File jFile, Uri uri) {
        String id = jFile.getName();
        String title = getTitleFromUri(uri);
        long size = jFile.length();
        String type = Constants.PDF_MIME_TYPE;

        return new File(id, null, title, size, type);
    }

    private DeviceMeta createDeviceMeta() {
        String deviceId = DeviceInfoFactory.getDeviceId(this);
        int page = 1;
        int zoom = 1;
        boolean linked = true;

        return new DeviceMeta(deviceId, page, zoom, linked);
    }

    private DeviceSet createDeviceSet(File vFile) {
        String id = IdFactory.getRandomId();
        String fileId = vFile.getId();
        Map<String, DeviceMeta> devices = new HashMap<>();

        return new DeviceSet(id, fileId, devices);
    }

    private void joinDeviceSet(DeviceSet ds) {
        // TODO(youngseokyoon): use the blobref instead.
        java.io.File jFile = new java.io.File(getCacheDir(), ds.getFileId());

        // Initialize the pdf viewer widget with the file content.
        // TODO(youngseokyoon): enable swipe and handle the page change events.
        mPdfView.fromFile(jFile)
                .enableSwipe(false)
                .load();

        // Create a new device meta, and update the device set with it.
        Log.i(TAG, "Joining device set: " + ds.getId());
        DeviceMeta dm = createDeviceMeta();
        ds.getDevices().put(dm.getDeviceId(), dm);
        mDB.updateDeviceSet(ds);

        mCurrentDS = ds;
    }

    private void leaveDeviceSet() {
        if (mCurrentDS == null) {
            return;
        }

        Log.i(TAG, "Leaving device set: " + mCurrentDS.getId());
        Map<String, DeviceMeta> devices = mCurrentDS.getDevices();
        devices.remove(DeviceInfoFactory.getDeviceId(this));

        if (devices.isEmpty()) {
            Log.i(TAG, "Last one to leave the device set. Deleting " + mCurrentDS.getId());
            mDB.deleteDeviceSet(mCurrentDS.getId());
        } else {
            mDB.updateDeviceSet(mCurrentDS);
        }

        mCurrentDS = null;
    }

    private java.io.File getFileFromUri(Uri uri) {
        Log.i(TAG, "File Uri: " + uri.toString());

        try (InputStream in = getContentResolver().openInputStream(uri)) {
            // Get the entire file contents as a byte array.
            byte[] bytes = ByteStreams.toByteArray(in);

            // Write the contents in a temporary file.
            // For now, use the md5 hash string of the file as the filename.
            // TODO(youngseokyoon): use the Syncbase blob to store the file.

            String fileKey = IdFactory.getFileId(bytes);
            if (fileKey == null) {
                fileKey = IdFactory.getRandomId();
                Log.w(TAG, "Could not get the MD5 hash string for Uri: " + uri.toString());
                Log.w(TAG, "- Using a random UUID instead.");
            }
            Log.i(TAG, "FileKey: " + fileKey);

            java.io.File jFile = new java.io.File(getCacheDir(), fileKey);
            if (jFile.exists() && jFile.length() == bytes.length) {
                Log.i(TAG, "The file already exists in the cache directory.");
                return jFile;
            }

            Log.i(TAG, "Creating pdf file: " + jFile.getPath());
            try (FileOutputStream out = new FileOutputStream(jFile)) {
                out.write(bytes);
            }

            return jFile;
        } catch (IOException e) {
            handleException(e);
        }

        return null;
    }

    private String getTitleFromUri(Uri uri) {
        try {
            Cursor cursor = getContentResolver().query(uri, null, null, null, null);

            int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
            cursor.moveToFirst();
            return cursor.getString(nameIndex);
        } catch (Exception e) {
            handleException(e);

            if (uri != null) {
                return uri.getLastPathSegment();
            }
        }

        return null;
    }

    private DeviceMeta getDeviceMeta() {
        return getDeviceMeta(mCurrentDS);
    }

    private DeviceMeta getDeviceMeta(DeviceSet ds) {
        String deviceId = DeviceInfoFactory.getDeviceId(this);

        if (ds == null || !ds.getDevices().containsKey(deviceId)) {
            return null;
        }

        return ds.getDevices().get(deviceId);
    }

    /**
     * Move all the linked pages to their previous pages.
     */
    private void prevPage() {
        if (mCurrentDS == null) {
            return;
        }

        // First, check if this device is linked or not.
        // If not, simply move the page of the current device.
        if (!getDeviceMeta().getLinked()) {
            DeviceMeta dm = getDeviceMeta();
            if (dm.getPage() > 1) {
                dm.setPage(dm.getPage() - 1);
            }

            return;
        }

        // Move all the linked pages
        Map<String, DeviceMeta> linkedDevices = getLinkedDevices();
        int smallestPage = getSmallestPage(linkedDevices);

        if (smallestPage > 1) {
            for (String deviceId : linkedDevices.keySet()) {
                DeviceMeta dm = linkedDevices.get(deviceId);
                dm.setPage(dm.getPage() - 1);
            }

            mDB.updateDeviceSet(mCurrentDS);
        }
    }

    /**
     * Move all the linked pages to their next pages.
     */
    private void nextPage() {
        if (mCurrentDS == null) {
            return;
        }

        // First, check if this device is linked or not.
        // If not, simply move the page of the current device.
        if (!getDeviceMeta().getLinked()) {
            DeviceMeta dm = getDeviceMeta();
            if (dm.getPage() < mPdfView.getPageCount()) {
                dm.setPage(dm.getPage() + 1);
            }

            return;
        }

        // Move all the linked pages
        Map<String, DeviceMeta> linkedDevices = getLinkedDevices();
        int largestPage = getLargestPage(linkedDevices);

        if (largestPage < mPdfView.getPageCount()) {
            for (String deviceId : linkedDevices.keySet()) {
                DeviceMeta dm = linkedDevices.get(deviceId);
                dm.setPage(dm.getPage() + 1);
            }

            mDB.updateDeviceSet(mCurrentDS);
        }
    }

    private Map<String, DeviceMeta> getLinkedDevices() {
        if (mCurrentDS == null) {
            return null;
        }

        Map<String, DeviceMeta> devices = mCurrentDS.getDevices();
        Map<String, DeviceMeta> result = new HashMap<>();
        for (String deviceId : devices.keySet()) {
            DeviceMeta dm = devices.get(deviceId);
            if (dm.getLinked()) {
                result.put(deviceId, dm);
            }
        }

        return result;
    }

    private int getSmallestPage(Map<String, DeviceMeta> devices) {
        int result = -1;

        for (String deviceId : devices.keySet()) {
            DeviceMeta dm = devices.get(deviceId);
            if (result == -1 || dm.getPage() < result) {
                result = dm.getPage();
            }
        }

        return result;
    }

    private int getLargestPage(Map<String, DeviceMeta> devices) {
        int result = -1;

        for (String deviceId : devices.keySet()) {
            DeviceMeta dm = devices.get(deviceId);
            if (result == -1 || dm.getPage() > result) {
                result = dm.getPage();
            }
        }

        return result;
    }

    private static void handleException(Exception e) {
        Log.e(TAG, e.getMessage(), e);
    }

}
