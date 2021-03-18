module.exports = {
	AUTH_ERRORS: {
		code: 403,
		USER_NOT_FOUND: "Người dùng không tồn tại",
		USER_EXISTED: "Người dùng đã tồn tại",
		INVALID_USER_NAME_PASSWORD: "Username hoặc Mật khẩu không hợp lệ",
		INVALID_TOKEN: "Token không hợp lệ",
		ACCESS_DENIED: "Không được phép truy cập",
	},
	INPUT_ERRORS: {
		code: 400, //bad request
		BAD_INPUT: "Dữ liệu nhập vào không hợp lệ",
	},
	DATABASE_CONNECTION_ERRORS: {
		code: 500, //internal server error
		MISSING_DB_DESC: "Lỗi khởi tạo kết nối CSDL :: MISSING_DB_DESC",
		MISSING_DIALEC: "Lỗi khởi tạo kết nối CSDL :: MISSING_DIALEC",
		MISING_DB_NAME: "Lỗi khởi tạo kết nối CSDL :: MISING_DB_NAME",
		MISSING_DB_USRNAME: "Lỗi khởi tạo kết nối CSDL :: MISSING_DB_USRNAME",
		MISSING_DB_USRPWD: "Lỗi khởi tạo kết nối CSDL :: MISSING_DB_USRPWD",
		MISSING_DB_HOST: "Lỗi khởi tạo kết nối CSDL :: MISSING_DB_HOST",
		MISSING_DB_PORT: "Lỗi khởi tạo kết nối CSDL :: MISSING_DB_PORT",
		MISSING_MODELS: "Lỗi khởi tạo kết nối CSDL :: MISSING_MODELS",
	},
	CRUD_USER_ERRORS: {
		code: 500,
		ERR_UPDATE_USER: "Lỗi cập nhật hồ sơ người dùng",
	},
	CRUD_NOTE_ERRORS: {
		code: 500,
		ERR_LISTING_NOTE: "Lỗi truy vấn Notes",
		ERR_CREATING_NOTE: "Lỗi tạo Note",
		ERR_UPDATING_NOTE: "Lỗi cập nhật Note",
		ERR_DELETING_NOTE: "Lỗi xoá Note",
	},
};
