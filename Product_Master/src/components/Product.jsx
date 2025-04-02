import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'

import {
  FaPlus,
  FaEye,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTrash,
  FaEdit,
  FaMoon,
  FaSun,
  FaFilePdf
} from 'react-icons/fa'
import './Product.css'
import axios from 'axios'

export default function Product () {
  const [theme, setTheme] = useState('dark') // Default Dark Mode
  const [showForm, setShowForm] = useState(false)
  const [showProduct, setShowProduct] = useState(false)
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productImage, setProductImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null) // New state for image preview
  const [ska, setSka] = useState('')
  const [brandName, setBrandName] = useState('')
  const [price, setPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [dimensions, setDimensions] = useState('')
  const [status, setStatus] = useState('active')
  const [discount, setDiscount] = useState('')
  const [rating, setRating] = useState('')
  const [record, setRecord] = useState([])
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const formRef = useRef(null)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchApi()
    const interval = setInterval(fetchApi, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])
  
  useEffect(() => {
    checkLowStock()
    checkDiscounts()
  }, [record])
  
  const checkDiscounts = useCallback(() => {
    record.forEach(product => {
      if (Number(product.discount) > 20) {
        const lastNotified = localStorage.getItem(`discount_${product._id}`)
        if (!lastNotified || Date.now() - lastNotified > 3600000) { 
          sendDiscountNotification(product)
          localStorage.setItem(`discount_${product._id}`, Date.now())
        }
      }
    })
  }, [record])
  
  const sendDiscountNotification = product => {
    if (Notification.permission === 'granted') {
      new Notification('🎉 Discount Alert!', {
        body: `${product.productName} is now ${product.discount}% off!`,
        icon: 'discount-icon.png'
      })
    }
  }
  
  const checkLowStock = useCallback(() => {
    record.forEach(product => {
      if (product.stockQuantity < 5) {
        const lastNotified = localStorage.getItem(`stock_${product._id}`)
        if (!lastNotified || Date.now() - lastNotified > 3600000) { 
          sendStockNotification(product)
          localStorage.setItem(`stock_${product._id}`, Date.now())
        }
      }
    })
  }, [record])
  
  const sendStockNotification = product => {
    if (Notification.permission === 'granted') {
      new Notification('⚠️ Low Stock Alert!', {
        body: `${product.productName} is running low on stock! Only ${product.stockQuantity} left.`,
        icon: 'low-stock-icon.png'
      })
    }
  }
  

  const fetchApi = async () => {
    const response = await axios.get('http://localhost:1155')
    console.log('data:', response.data)
    setRecord(response.data.data)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!productName || !productDescription || !price || !stockQuantity) {
      alert('Please fill in all required fields')
      return
    }

    if (isNaN(price) || isNaN(stockQuantity)) {
      alert('Price and Stock Quantity should be numbers')
      return
    }
    const discountDecimal = discount / 100
    const discountedPrice = price - price * discountDecimal

    const formData = new FormData()
    formData.append('productName', productName)
    formData.append('productDescription', productDescription)
    formData.append('ska', ska)
    formData.append('brandName', brandName)
    formData.append('price', price)
    formData.append('discountedPrice', discountedPrice.toFixed(2))
    formData.append('stockQuantity', stockQuantity)
    formData.append('weight', weight)
    formData.append('weightUnit', weightUnit)
    formData.append('dimensions', dimensions)
    formData.append('status', status)
    formData.append('discount', discount)
    formData.append('rating', rating)

    if (productImage) {
      formData.append('image', productImage)
    }

    if (editId === null) {
      try {
        await axios.post('http://localhost:1155/addData', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setMessage('Product added successfully!')
        alert('Product added successfully!')
      } catch (error) {
        console.error(
          'Error submitting data:',
          error.response?.data || error.message
        )
      }
    } else {
      await axios.put(`http://localhost:1155/updateData/${editId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage('Product updated successfully!')
      alert('Product updated successfully!')
    }

    fetchApi()
    resetForm()
  }

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product?'
    )
    if (!confirmDelete) {
      return
    }
    try {
      await axios.delete(`http://localhost:1155/deleteData/${id}`)
      fetchApi()
      setMessage('Product deleted successfully!')
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  const resetForm = () => {
    setProductName('')
    setProductDescription('')
    setProductImage('')
    setSka('')
    setBrandName('')
    setPrice('')
    setStockQuantity('')
    setWeight('')
    setWeightUnit('kg')
    setDimensions('')
    setStatus('active')
    setDiscount('')
    setRating('')
    setEditId(null)
    setProductImage(null)
    setImagePreview(null)
    if (document.getElementById('imageInput')) {
      document.getElementById('imageInput').value = ''
    }
  }
  const handleEdit = id => {
    console.log('Editing Product ID:', id)
    const confirmEdit = window.confirm(
      'Are you sure you want to edit this product?'
    )
    if (!confirmEdit) return

    const productToEdit = record.find(item => item._id === id)
    if (!productToEdit) {
      alert('Product not found!')
      return
    }

    setProductName(productToEdit.productName || '')
    setProductDescription(productToEdit.productDescription || '')
    setSka(productToEdit.ska || '')
    setBrandName(productToEdit.brandName || '')
    setPrice(productToEdit.price || '')
    setStockQuantity(productToEdit.stockQuantity || '')
    setWeight(productToEdit.weight || '')
    setWeightUnit(productToEdit.weightUnit || 'kg')
    setDimensions(productToEdit.dimensions || '')
    setStatus(productToEdit.status || 'active')
    setDiscount(productToEdit.discount || '')
    setRating(productToEdit.rating || '')
    setEditId(productToEdit._id || '')
    setProductImage(null)
    setImagePreview(
      productToEdit.image
        ? `http://localhost:1155/${productToEdit.image}`
        : null
    )

    setShowForm(true) // Make sure this is set

    console.log('Form Data Set:', productToEdit)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleImageChange = e => {
    const file = e.target.files[0]

    if (file) {
      const fileType = file.type.split('/')[1]
      const fileSize = file.size / 1024 / 1024
      if (!['jpg', 'jpeg', 'png'].includes(fileType)) {
        alert('Invalid file type. Only JPG and PNG are allowed.')
        setProductImage(null)
        setImagePreview(null)
        return
      }

      if (fileSize > 5) {
        alert('File size too large. Maximum size is 5MB.')
        setProductImage(null)
        setImagePreview(null)
        return
      }

      setMessage('')
      setProductImage(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  const downloadPDF = () => {
    window.open('http://localhost:1155/download-pdf', '_blank')
  }

  const sortedData = useMemo(() => {
    const filteredData = record.filter(item => {
      return (item.productName?.toLowerCase() || '').includes(
        search.toLowerCase()
      )
    })

    return filteredData.sort((a, b) => {
      const discountedPriceA = a.price - (a.price * a.discount) / 100
      const discountedPriceB = b.price - (b.price * b.discount) / 100

      return sortOrder === 'asc'
        ? discountedPriceA - discountedPriceB
        : discountedPriceB - discountedPriceA
    })
  }, [record, search, sortOrder])

  const getDiscountedPrice = (price, discount) => {
    const discountDecimal = discount / 100
    const discountedPrice = price - price * discountDecimal
    return discountedPrice.toFixed(2)
  }

  const getStockAlert = stockQuantity => {
    return stockQuantity < 5 ? 'Low Stock!' : 'In Stock'
  }
  const itemsPerPage = 2
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const colors = ['#BB86FC', '#03DAC6', '#CF6679', '#FFB74D']

  return (
    <div
      className={`category-container ${
        theme === 'dark' ? 'dark-theme' : 'light-theme'
      }`}
    >
      <div className='category-container'>
        {!showProduct && (
          <div className='modal'>
            <div className='modal-content'>
              {showForm && (
                <div className='modal'>
                  <div className='modal-content'>
                    <form
                      onSubmit={handleSubmit}
                      className='form-container'
                      ref={formRef}
                    >
                      <span
                        className='close-btn'
                        onClick={() => setShowForm(false)}
                      >
                        &times;
                      </span>
                      <label>Product Name</label>
                      <input
                        type='text'
                        value={productName}
                        onChange={e =>
                          setProductName(
                            e.target.value.replace(/[^A-Za-z\s]/g, '')
                          )
                        }
                        className='input-field'
                        placeholder='Enter product name'
                        required
                      />

                      <label>Product Description</label>
                      <textarea
                        value={productDescription}
                        onChange={e =>
                          setProductDescription(
                            e.target.value.replace(/[^A-Za-z\s]/g, '')
                          )
                        }
                        className='input-field'
                        placeholder='Enter product description'
                        required
                      ></textarea>
                      <label>Product Image</label>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageChange}
                        className='input-field'
                        id='imageInput'
                        required={editId === null}
                        />
                      {imagePreview && (
                        <div className='image-preview'>
                          <img src={imagePreview} alt='Preview' width='100' />
                        </div>
                      )}
                      <label>SKA</label>
                      <input
                        type='text'
                        value={ska}
                        onChange={e => setSka(e.target.value)}
                        className='input-field'
                        placeholder='Enter SKA'
                        required
                        />

                      <label>Brand Name</label>
                      <input
                        type='text'
                        value={brandName}
                        onChange={e =>
                          setBrandName(
                            e.target.value.replace(/[^A-Za-z\s]/g, '')
                          )
                        }
                        className='input-field'
                        placeholder='Enter brand name'
                        required
                      />
                      <label>Price</label>
                      <input
                        type='number'
                        value={price}
                        onChange={e =>
                          setPrice(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        className='input-field'
                        placeholder='Enter product price'
                        required
                        />
                      <label>Stock Quantity</label>
                      <input
                        type='number'
                        value={stockQuantity}
                        onChange={e =>
                          setStockQuantity(
                            e.target.value.replace(/[^0-9]/g, '')
                          )
                        }
                        className='input-field'
                        placeholder='Enter stock quantity'
                        required
                        />
                      <label>Weight</label>
                      <div className='input-with-unit'>
                        <input
                          type='number'
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                          className='input-field'
                          placeholder='Enter weight'
                          required
                        />
                        <select
                          value={weightUnit}
                          onChange={e => setWeightUnit(e.target.value)}
                          className='unit-selector'
                          required
                          >
                          <option value='kg'>kg</option>
                          <option value='g'>g</option>
                        </select>
                      </div>
                      <label>Dimensions</label>
                      <input
                        type='text'
                        value={dimensions}
                        onChange={e => setDimensions(e.target.value)}
                        className='input-field'
                        placeholder='Enter product dimensions'
                        required
                        />
                      <label>Status</label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className='input-field'
                        required
                        >
                        <option value='active'>Active</option>
                        <option value='inactive'>Inactive</option>
                      </select>
                      <label>Discount</label>
                      <input
                        type='number'
                        value={discount}
                        onChange={e =>
                          setDiscount(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        className='input-field'
                        placeholder='Enter discount percentage'
                        required
                      />
                      <label>Rating</label>
                      <input
                        type='number'
                        value={rating}
                        onChange={e => setRating(e.target.value)}
                        className='input-field'
                        step='0.1'
                        max='5'
                        min='0'
                        placeholder='Enter product rating'
                        required
                        />

                      <button type='submit' className='submit-btn'>
                        {editId === null ? 'Add Product' : 'Update Product'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
              <center>
                {' '}
                <h2 style={{ margin: '10px' }}>Product Management System</h2>
              </center>
              {message && <div className='message'>{message}</div>}
              <div className='search-sort-container'>
                <div className='search-container'>
                  <label>Search Products</label>
                  <input
                    type='text'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className='input-field'
                    placeholder='Search by ProductName.'
                    />
                </div>
              </div>
              <div className='search-sort-container'>
                <div className='sort-buttons'>
                  <button onClick={downloadPDF} className='add-btn'>
                    <FaFilePdf />
                    PDF Download
                  </button>

                  <button
                    onClick={() =>
                      setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                  >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>

                  <button onClick={() => setShowForm(true)} className='add-btn'>
                    <FaPlus /> Add Product
                  </button>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    className='add-btn'
                  >
                    {sortOrder === 'asc' ? (
                      <FaSortAmountDown />
                    ) : (
                      <FaSortAmountUp />
                    )}
                    Sort by Price ({sortOrder === 'asc' ? 'Desc' : 'Asc'})
                  </button>

                  <button
                    onClick={() => setShowProduct(true)}
                    className='add-btn'
                  >
                    <FaEye /> View Product
                  </button>
                </div>
              </div>
              <table className='category-table'>
                <thead>
                  <tr>
                    <th>Product Image</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(item => (
                    <tr key={item._id}>
                      <td>
                        {item.image ? (
                          <img
                            src={`http://localhost:1155/${item.image}`}
                            alt='Product'
                            width='100'
                          />
                        ) : (
                          'No Image'
                        )}
                      </td>
                      <td>{item.productName}</td>
                      <td>
                        {item.discount === 0 ? (
                          <span>${item.price}</span>
                        ) : (
                          <>
                            <span style={{ textDecoration: 'line-through' }}>
                              ${item.price}
                            </span>
                            <span style={{ color: 'red', marginLeft: '5px' }}>
                              ${getDiscountedPrice(item.price, item.discount)}
                            </span>
                          </>
                        )}
                      </td>
                      <td
                        style={{
                          color: item.stockQuantity < 5 ? 'red' : 'green',
                          fontWeight: 'bold'
                        }}
                      >
                        {item.stockQuantity}{' '}
                        {item.stockQuantity < 5 ? '⚠️ Low Stock!' : ''}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className='action-btn delete-btn'
                          >
                          <FaTrash />
                        </button>

                        <button
                          onClick={() => handleEdit(item._id)}
                          className='action-btn edit-btn'
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                className='search-sort-container'
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'end'
                }}
              >
                <div
                  className='sort-buttons'
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <button
                    onClick={() =>
                      setCurrentPage(prev => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className='add-btn'
                    >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className='add-btn'
                    >
                    Next
                  </button>
                </div>
              </div>
              <div
                className='pie-chart-container'
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h2>Price According Pie Chart</h2>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={sortedData}
                      dataKey='price'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={100}
                      label
                      >
                      {sortedData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {showProduct && (
          <div className='modal'>
            <div className='modal-content'>
              <span className='close-btn' onClick={() => setShowProduct(false)}>
                &times;
              </span>
              <table className='category-table'>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Product Description</th>
                    <th>Product Image</th>
                    <th>SKA</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock Quantity</th>
                    <th>Weight</th>
                    <th>Dimensions</th>
                    <th>Status</th>
                    <th>Discount</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.productName}</td>
                      <td>{item.productDescription}</td>
                      <td>
                        {item.image ? (
                          <img
                            src={`http://localhost:1155/${item.image}`}
                            alt='Product'
                            width='100'
                          />
                        ) : (
                          'No Image'
                        )}
                      </td>
                      <td>{item.ska}</td>
                      <td>{item.brandName}</td>
                      <td>
                        {item.discount === 0 ? (
                          <span>${item.price}</span>
                        ) : (
                          <>
                            <span style={{ textDecoration: 'line-through' }}>
                              ${item.price}
                            </span>
                            <span
                              style={{
                                color: 'red',
                                marginLeft: '5px'
                              }}
                            >
                              ${getDiscountedPrice(item.price, item.discount)}
                            </span>
                          </>
                        )}
                      </td>
                      <td
                        style={{
                          color: item.stockQuantity < 5 ? 'red' : 'green',
                          fontWeight: 'bold'
                        }}
                      >
                        {item.stockQuantity}{' '}
                        {item.stockQuantity < 5 ? '⚠️ Low Stock!' : ''}
                      </td>
                      <td>
                        {item.weight} {item.weightUnit}
                      </td>
                      <td>{item.dimensions}</td>
                      <td>{item.status}</td>
                      <td>{item.discount}%</td>
                      <td>{item.rating}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className='action-btn delete-btn'
                        >
                          <FaTrash />
                        </button>
  
                        <button
                          onClick={() => handleEdit(item._id)}
                          className='action-btn edit-btn'
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                className='search-sort-container'
                style={{ textAlign: 'center' }}
              >
                <div
                  className='sort-buttons'
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className='add-btn'
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className='add-btn'
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
