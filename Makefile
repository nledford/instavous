build:
	docker build -t nledford/instavous .

run:
	docker run -it --mount type=bind,source=/Users/nledford/Downloads/instavous,target=/Instavous nledford/instavous