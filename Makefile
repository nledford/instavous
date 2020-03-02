build:
	docker build --pull -t nledford/instavous .

run:
	docker run -it --name "Instavous" --mount type=bind,source=/Users/nledford/Downloads/instavous,target=/Instavous nledford/instavous

update:
	ncu -u && npm i