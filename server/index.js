require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Use proper CORS config
app.use(cors({
  origin: ["http://localhost:3000", "https://yourfrontend.com"], // replace with your frontend domain
}));

app.use(express.json());

// ✅ Connect DB then mount routes
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // ✅ All routes
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/products", require("./routes/productRoutes"));
    app.use("/api/glass", require("./routes/glassRoutes"));
    app.use("/api/hsn", require("./routes/hsnRoutes"));
    app.use("/api/locks", require("./routes/lockRoutes"));
    app.use("/api/product-groups", require("./routes/productGroupRoutes"));
    app.use("/api/product-types", require("./routes/productTypeRoutes"));
    app.use("/api/projects", require("./routes/projectRoutes"));
    app.use("/api/unit", require("./routes/unitRoutes"));
    app.use("/api/aluminium", require("./routes/aluminiumRoutes"));
    app.use("/api/hardware", require("./routes/hardwareRoutes"));
    app.use("/api/finish", require("./routes/finishRoutes"));
    app.use("/api/quotationEditor", require("./routes/quotationEditorRoutes"));
    app.use("/api/mto", require("./routes/mtoRoutes"));

    app.get("/", (_req, res) => res.send("API up ✅"));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });
