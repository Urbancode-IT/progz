//server/services/fileServices.js
const fs = require('fs');
const path = require('path');

const deleteFile = (fileUrl) => {
  const filePath = path.join(__dirname, '..', fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = { deleteFile };
