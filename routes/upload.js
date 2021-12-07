const Router = require('express-promise-router')
const router = new Router()
const db = require('../db')
const auth = require('../auth')
const fileupload = require("express-fileupload");

module.exports = router
router.use(fileupload());
// router.use('/uploads', express.static(process.cwd() + '/uploads'))


router.post('/', function(req, res) {
    let sampleFile;
    let uploadPath;
    // console.log(req.files);
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.img;
    uploadPath = process.cwd() + '/uploads/' + sampleFile.name;
    let externalPath = "/uploads/"+sampleFile.name;
  
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
      if (err)
        return res.status(500).send(err);
  
      res.status(201).send({"externalPath":externalPath});
    });

    // return rowCount == 1 ? res.status(200).send("Success"):res.status(500).send("Something went wrong");

  });