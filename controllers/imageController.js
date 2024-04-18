const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage")
const dayjs = require("dayjs")

// not working. file type is wrong on firebase. Come back to this when free
// tried multer, converting to string then sending as object from client, doesnt work
const uploadImage = async (req, res) => {
  try {
    const file = req.file
    const storage = getStorage()
    const imagesRef = ref(storage, `images/${dayjs().format("DD-MM-YYYY, hh:mm:ssA")}, ${file.originalname}`)
    await uploadBytesResumable(imagesRef, file)
    const url = await getDownloadURL(imagesRef)
    res.json(url)
  } catch (error) {
    console.log(error)
    throw error
  }
}
module.exports = { uploadImage }
