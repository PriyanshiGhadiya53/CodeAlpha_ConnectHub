class apiResponse{
    constructor(statusCode, message,data)
    {
        this.statusCode=statusCode,
        this.message=message,
        this.data=data,
        this.success=statusCode <400
    } 
}

export {apiResponse}