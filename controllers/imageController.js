const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage")
const dayjs = require("dayjs")
const bodyParser = require("body-parser")
const uploadImage = async (req, res) => {
  try {
    const file = req.body
    //const fileName = file.name
    console.log(`file: ${req.body}`)

    //const storage = getStorage()
    //const imagesRef = ref(storage, `images/${dayjs().format("DD-MM-YYYY, hh:mm:ssA")} ${fileName}`)
    //await uploadBytesResumable(imagesRef, file)
    //const url = await getDownloadURL(imagesRef)
    //console.log(`url: ${url}, file: ${file}`)
    //res.json(url)
  } catch (error) {
    console.log(error)
    throw error
  }
}
module.exports = { uploadImage }
