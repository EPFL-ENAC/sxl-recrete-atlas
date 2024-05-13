.PHONY: prebuild, install, build, .help

help:
	@echo "Targets:"
	@echo "	install: Install node dependencies"
	@echo "	prebuild: Convert csv to json before build"
	@echo "	build: Build the project (run prebuild before)"

install:
	@echo "Installing node dependencies (npm)"
	npm install

prebuild:
	@echo "converting csv to json before build"
	npm run prebuild

build: prebuild
	@echo "Installing node dependencies (npm)"
	npm build
