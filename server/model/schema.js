const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  productName: {
    type: String,
    required: true,
    match: /^[a-zA-Z\s]+$/ 
  },
  productDescription: {
    type: String,
    required: true,
    match: /^[a-zA-Z\s]+$/ 
  },
  image: {
    type: String,
    required: true
  },
  ska: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true,
    match: /^[a-zA-Z\s]+$/ 
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0 
  },
  weight: {
    type: Number,
    required: true,
    min: 0 
  },
  weightUnit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'lb', 'oz'],  
    default: 'kg'  
  },
  dimensions: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    match: /^[a-zA-Z\s]+$/ 
  },
  discount: {
    type: Number,
    min: 0 
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5 
  },
})

const product = mongoose.model('Product', productSchema)
module.exports = product
