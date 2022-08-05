# Fbird
# Hướng dẫn cài đặt và chạy thử

+> cài đặt môi trường React native: https://reactnative.dev/docs/environment-setup
+> Cài Docker : https://docs.docker.com/desktop/
+> Cài yarn : https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable

# Với fbird-sc

B1: Trong file FBB.sol thay đổi baseURI theo địa chỉ localhost của máy tính.
B2: Tạo file .secret chứa privatekey account metamask của tài khoản mà mình muốn deploy lên đó
B3: Chạy yarn install để cài node-modules
B4: chạy lệnh npx hardhat run scripts/deploy.js --network testnet
B5: khi deploy thành công lấy địa chỉ của contract FBB.

# Với fbird-be

B1: Lấy địa chỉ của contract FBB bên trên thay vào các địa chỉ của dự án tại các file config.js, config.local.js, config.testnet.js
B2: Chạy yarn install để cài node-modules
B3: Kích chuột phải vào docker-compose.yml chọn compost Up (Chú ý nếu dùng IDE visual studio code thì cần cài extension Docker)
B4: Khi này Server của dự án đã chạy.

# Với fbird-fe

B1: Lấy địa chỉ của contract FBB bên trên thay vào địa chỉ của dự án tại các file config.js trong folder Contract
B2: Chạy yarn install để cài node-modules
B3: Muốn chạy trên iOS chạy : yarn ios
Đối với Android chạy : yarn android