
- Trip-api: API server
	npm install
	Cần config .env.example thành file .env và sửa các thông số environment variable. Cần postgresql, google mập api key, rabbitmq
	npm run start

- Trip-operator; Operator web app
	npm install
	Config .env api host và Googlmap key


Các app mobile cần setup môi trường dev react native

TripClient: mobile app cho khách hàng
	npm install
	npm run android

TripClient: mobile app cho Tài xế
	npm install
	npm run android