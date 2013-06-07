dist: all
	@echo Done

all:
	@echo Compiling coffee script
	coffee -cb *.coffee

watch:
	@echo Watch coffee script files
	coffee -wcb *.coffee

.PHONY: dist all watch
