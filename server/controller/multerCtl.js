const schema = require('../model/schema'); 
const fs = require("fs"); 
const PDFDocument = require("pdfkit"); // ✅ Required
const path = require("path");

module.exports.firstPage = async (req, res) => {
 const data = await schema.find({})
 
 res.json({data})
}

module.exports.addData = async (req, res) => {  

      // ✅ Image path correction
      req.body.image = req.file.path.replace(/\\/g, "/");

      // ✅ Save data to MongoDB
      let data = await schema.create(req.body)
      res.json({ message: "Data added successfully", data });
      console.log(data);

};  


module.exports.addImage = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    let image = req.file.path.replace(/\\/g, "/");
    let data = await schema.create({ image });
    
    res.json({ message: "Image uploaded successfully", data });
  
};



module.exports.deleteData = async (req, res) => {
  const singleData = await schema.findById(req.params.id);
  fs.unlinkSync(singleData.image);  
 await schema.findByIdAndDelete(req.params.id).then(() => {
    res.json('/')
  })
}

module.exports.updateData = async (req, res) => {
  try {
    const { productName,productDescription,ska,brandName,price,stockQuantity, weight,weightUnit, dimensions, status, discount, rating,categoryId } = req.body;
    const editID = req.params.id;

    const singleData = await schema.findById(editID);
    if (!singleData) return res.status(404).json({ error: "Data not found" });

    // ✅ Preserve old image if no new image is uploaded
    let img = singleData.image;
    if (req.file) {
      if (singleData.image) fs.unlinkSync(singleData.image); // Delete old image
      img = req.file.path.replace(/\\/g, "/");
    }

    const updatedData = await schema.findByIdAndUpdate(
      editID,
       { productName,productDescription,ska,brandName,price,stockQuantity, weight,weightUnit, dimensions, status, discount, rating ,categoryId,image: img} ,
      { new: true }
    );

    res.json({ message: "Data updated successfully", updatedData });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.generatePDF = async (req, res) => {
  const data = await schema.find();

  const doc = new PDFDocument({ size: "A4", margin: 50, layout: "landscape" });
  const filePath = "product";

  doc.pipe(fs.createWriteStream(filePath));
  doc.pipe(res);

  doc.rect(0, 0, doc.page.width, doc.page.height).fill("black");
  doc.fillColor("white");

  doc.fontSize(20).text("Product Data", { align: "center" });
  doc.moveDown();

  let x = 150; 
  let y = 100; 
  const columnWidth = 140; 

  data.forEach((item, index) => {
      if (index % 4 === 0 && index !== 0) { 
          x = 50;
          y += 180;
      }

      doc.fontSize(14).text(`Product ID: ${index + 1}`, x, y);
      doc.text(`Name: ${item.productName}`, x, y + 20);
      doc.text(`Price: $${item.price}`, x, y + 40);
      doc.text(`Stock: ${item.stockQuantity}`, x, y + 60);

      const imagePath = path.join(__dirname, "../", item.image);
      if (fs.existsSync(imagePath)) {
          doc.image(imagePath, x, y + 80, { width: 100, height: 70 });
      } else {
          doc.text("No Image", x, y + 80);
      }  doc.moveDown(5);

      doc.text(`SKU: ${item.ska}`);
      doc.text(`Brand: ${item.brandName}`);
      doc.text(`Price: $${item.price}`);
      doc.text(`Stock: ${item.stockQuantity}`);
      doc.text(`Weight: ${item.weight} ${item.weightUnit}`);
      doc.text(`Dimensions: ${item.dimensions}`);
      doc.text(`Status: ${item.status}`);
      doc.text(`Discount: ${item.discount}%`);
      doc.text(`Rating: ${item.rating}`);
      doc.text("------------------");

      x += columnWidth;  
  });

  doc.end();
};