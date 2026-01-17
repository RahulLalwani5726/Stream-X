class ApiError extends Error{
    constructor(
        statusCode,
        messege = "Somthing Went Wrong",
        error = [],
        stack
    ){
        super(messege); // super se humne Error class ka constructor call kiye similur to java jo execusion thred ko rok kr error dega
        this.statusCode = statusCode;
        this.messege = messege;
        this.error = error;
        this.statusCode = statusCode;

        // if(stack){
        //     this.stack = stack;
        // }else{
        //     this.stack = Error.prototype.stack();
        // }
    }
}
export {ApiError}
// ab humne apierror ke class bna kr ek structure bna diya hai je error me kya property hone cahuye aur error dena ke liye is class ka bs ek obj bna kr return kr denge aur dot (.) se hum iske messege aur property ko access kr sakte hai