const express = require("express")
const route = express.Router()
const ctl = require("../controller/multerCtl")
const multer = require("multer");
const schema = require("../model/schema");

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },

    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now())
    }
})
const upload = multer({storage : Storage}).single("image");

route.get("/", ctl.firstPage);
route.post("/addImage",upload,ctl.addImage);
route.post("/addData",upload,ctl.addData);
route.delete("/deleteData/:id", ctl.deleteData);
route.put("/updateData/:id",upload,ctl.updateData);
route.get("/download-pdf", ctl.generatePDF);

module.exports = route;