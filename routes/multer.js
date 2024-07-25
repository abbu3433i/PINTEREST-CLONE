const multer = require("multer");
const {v4: uuidv4} = require("uuid");

const path = require("path"); //---------path

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        const uniquename = uuidv4(); //-----ye image ka unique naam nikaal ke dega jo bhi img hum gallary se upload karenge 
      cb(null, uniquename+path.extname(file.originalname));
    }
  })
  
  module.exports = multer({ storage: storage })