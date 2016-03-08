MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := all
.SUFFIXES:

.PHONY: all
all: .packages doc
	@true # silences watch

.packages: pubspec.yaml
	pub get

.PHONY: upgrade
upgrade:
	pub upgrade

.PHONY: analyze
analyze:
	@echo "=== Analyzing Dart code ==="
	dartanalyzer lib/main.dart --lints --fatal-hints --fatal-warnings

.PHONY: fmt
fmt: packages
	dartfmt --overwrite lib

doc:
	dartdoc
	@touch $@

.PHONY: test
test: analyze
	@echo "=== Running tests ==="
	flutter test --engine-src-path ~/Code/engine/src
