const Product = require("../models/Product")
const Order = require("../models/Order")
const getStats = async (req, res)=>{
    try{
        const totalProducts = await Product.countDocuments()
        const totalOrders = await Order.countDocuments()
        const pendingOrders = await Order.countDocuments({
            status: "Pending"
        })
        const orders = await Order.find()
        const redeemedPoints = orders.reduce((sum, order)=> sum + order.totalPoints,0)
        res.json({
            totalProducts,
            totalOrders,
            pendingOrders,
            redeemedPoints,
        })
    }catch(error){
        res.status(500).json({
            message:error.message,
        })
    }
}
module.exports = {getStats}