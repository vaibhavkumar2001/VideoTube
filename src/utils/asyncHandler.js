// YEH HM ISLIYE LIKH RHE H KYONKI JB MAIN DB KO BAAR BAAR CLL KAROONGA CONNECT HONE KE LIYE TOH MAIN BAAR BAAR PURA CODE THODI LIKOONGA DB CONNECT KA 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }




// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

//  ************EK YEH BHI TARIKA H JOH COMPANY MEIN USE HOTA H *****************************************


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }