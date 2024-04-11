version=$(shell date +%FT%H:%M)
bucket=10208-fcd9acb029f419e6493edf97f4592b96

help:
	@echo s3://${bucket}/alice-perl-eerl-urbtrees/${version}/

transform:
	python3 ./transform.py

martin:
	python3 ./martin.py

cdn: cdn-data

cdn-data:
	mkdir -p data && \
	cp input/*/*_graph.png data && \
	s3cmd put --recursive --acl-public --guess-mime-type data s3://${bucket}/alice-perl-eerl-urbtrees/${version}/

cdn-ls:
	s3cmd ls --acl-public s3://10208-fcd9acb029f419e6493edf97f4592b96/alice-perl-eerl-urbtrees/