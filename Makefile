build:
	docker build --pull -t nledford/instavous .

build_dev:
	docker build --no-cache --pull -t nledford/instavous .

run:
	docker run -it --rm --name "Instavous" --mount type=bind,source=/Users/nledford/Downloads/instavous,target=/Instavous nledford/instavous

update:
	ncu -u && npm i