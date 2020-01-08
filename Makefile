build:
	docker build -t nledford/instavous .

run:
	docker run \ 
		--mount type=bind,source=/Users/nledford/Downloads/instavous,target=/Instavous \ 
		nledford/instavous