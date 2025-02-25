const { checkAuthToken } = require("../middleware/auth");
const responseHandler = require("../ResponseHandler");
const AdsService = require("../services/AdsService");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");

module.exports = (router) => {
  //Use memory storage to upload images directly
  const upload = multer({ storage: multer.memoryStorage() });

  //Azure Storage Configuration
  const AZURE_STORAGE_CONNECTION_STRING =
    "DefaultEndpointsProtocol=https;AccountName=dytstorage;AccountKey=adrbqNi3IgyuPDfiJVOGg9cw/X9RqaPeoJz9o2+/n292oWxMP43zgHvSL5X0BBWoaukwuq0Zqayk+AStsbnsBg==;EndpointSuffix=core.windows.net";

  //Create Blob Service Client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerName = "dytimagescontainer";
  const containerClient = blobServiceClient.getContainerClient(containerName);

  //Route for Uploading Ads
  router.post("/add/ads-details", upload.array("images"), async (req, res) => {
    try {
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded!" });
      }

      // ✅ Parse `position` field safely
      try {
        req.body.position = req.body.position
          ? JSON.parse(req.body.position)
          : [];
      } catch (err) {
        return res.status(400).json({ message: "Invalid position format" });
      }

      // ✅ Ensure `req.body.image` exists as an array
      let imageUrls = [];

      // ✅ Upload Multiple Images to Azure Blob Storage
      for (const file of req.files) {
        console.log("Processing file:", file.originalname);

        const blobName = `image_${uuidv1()}_${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // ✅ Upload file buffer to Azure
        await blockBlobClient.upload(file.buffer, file.buffer.length);

        // ✅ Store uploaded image URL inside `imageUrls` array
        imageUrls.push(
          `https://dytstorage.blob.core.windows.net/${containerName}/${blobName}`
        );
      }

      // ✅ Assign `imageUrls` to `req.body.image`
      req.body.image = imageUrls;
      console.log("Final Image URLs:", req.body.image);

      // ✅ Save Data Using AdsService
      let adsServiceInst = new AdsService();
      return responseHandler(req, res, adsServiceInst.adsUpload(req.body));
    } catch (error) {
      console.error("Error uploading files:", error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  });

  router.get("/member/ads/list", checkAuthToken, async (req, res) => {
    try {
      console.log("req check", req.query);
      let adsServiceInst = new AdsService();
      return responseHandler(req, res, adsServiceInst.adsList());
    } catch (error) {
      console.log(error);
    }
  });
  
  router.delete("/member/ads-delete/:user_id", async (req, res) => {
     try {
       console.log("checkk delete=>", req.params.user_id)
       if (!req.params.user_id) {
         return Promise.reject(
           new errors.ValidationFailed(RESPONSE_MESSAGE.USER_ID_REQUIRED)
         );
       }
       let user_id = req.params.user_id;
       let adsServiceInst = new AdsService();
       return responseHandler(req, res, adsServiceInst.adsDelete(user_id));
     } catch (e) {
       console.log(e);
       responseHandler(req, res, Promise.reject(e));
     }
   });
};
