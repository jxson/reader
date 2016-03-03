MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := all
.SUFFIXES:

.PHONY:
all: packages
	@true # silences watch

packages: pubspec.yaml flutter.yaml
	pub get
	@touch $@
