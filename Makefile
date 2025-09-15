.PHONY:  help cdn prebuild install build .help

# Date: 2025-09-15
# Version: 1.1
# Description: Makefile for sxl-recrete-atlas project
# Author: Pierre Guilbert (<pierreguilbert@epfl.ch>)
# Usage: make install
# ========================================
# Check for required tools
REQUIRED_TOOLS := s3cmd
$(foreach tool,$(REQUIRED_TOOLS),\
    $(if $(shell which $(tool)),,$(error "$(tool) not found in PATH")))


PROCESSED_DATA_DIR = $(shell pwd)/public/images
# Change the version and date accordingly
# version=1.0
version=2025-09-15
# private bucket not accessible to public
bucket=10208-fcd9acb029f419e6493edf97f4592b96
path=sxl-atlas-recrete/${version}
S3CMD_CONFIG_NAME=.s3cfg_cdn_enac
data_dir=$(PROCESSED_DATA_DIR)


help:
	@echo "Targets:"
	@echo "	install: Install node dependencies"
	@echo "	prebuild: Convert csv to json before build"
	@echo "	build: Build the project (run prebuild before)"

cdn:
	# http://s3.epfl.ch/10208-fcd9acb029f419e6493edf97f4592b96/sxl-atlas-recrete/2025-09-15/images/
	s3cmd -c ${HOME}/${S3CMD_CONFIG_NAME} put --recursive --acl-public --guess-mime-type --exclude='.DS_Store' --exclude='.gitignore' ${data_dir} s3://${bucket}/${path}/
	@echo "CDN upload complete"

install:
	@echo "Installing node dependencies (npm)"
	npm install

prebuild:
	@echo "converting csv to json before build"
	npm run prebuild

build:
	@echo "Installing node dependencies (npm)"
	npm build

run:
	@echo "Running the project"
	npm run dev



