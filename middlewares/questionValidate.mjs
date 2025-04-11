export const validateCreateQuestionData = (req,res,next) => {
    const {title, description, category} = req.body 
    
    if(!title || !description || !category){
        return res.status(400).json({
            message : "Invalid request data."
        })
    }
    
    next()
}