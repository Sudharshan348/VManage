import connectDb from "@/lib/db/mongoose"
import { ApiResponse } from "@/lib/Utils/apiresponse"

export async function GET() {
    await connectDb()  
    return Response.json(new ApiResponse(200,null,"MongoDB connected successfully"))
}
