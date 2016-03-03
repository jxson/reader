MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := all
.SUFFIXES:

.PHONY:
all: dependencies
	@true # silences watch

.PHONY:
dependencies: .packages

.packages: pubspec.yaml
	pub get
