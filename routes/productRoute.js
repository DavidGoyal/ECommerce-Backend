const express=require("express");
const { getAllProducts,createProduct,updateProduct, deleteProduct, getSingleProduct, addReview, getAllReviews, deleteReview, getAllAdminProducts } = require("../controllers/productController");
const { isAuthenticatedUser,authorizeRoles } = require("../middleware/auth");


const router=express.Router();


router.route("/products").get(getAllProducts);

router.route("/admin/products").get(isAuthenticatedUser, authorizeRoles("admin"), getAllAdminProducts)

router.route("/admin/products/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);

router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
  
router.route("/products/:id").get(getSingleProduct);

router.route("/review").put(isAuthenticatedUser,addReview);

router.route("/reviews").get(getAllReviews).delete(isAuthenticatedUser,deleteReview);

module.exports=router