const mongoose = require("mongoose")
// storing a schemaConstructor in a variable
const postSchemaConstructor = mongoose.Schema
// using the constructor to create a schema Object 
const commentReplies = new postSchemaConstructor({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    reply : {
        type : String,
        required : [true, "cannot make an empty reply/response to the comment"]
    }
},
    {timestamps : true}
)


const commentSchema = new postSchemaConstructor({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    comment : {
        type : String,
        required : [true, "Cannot make an empty comment"]
    },
    replies : [commentReplies],
    likes : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            }
        }
    ],
    dislikes : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            }
        }
    ]
},
    {timestamps : true}
)


const postSchema = new postSchemaConstructor({
    title : {
        type : String,
        required : [true, "Please provide a title for your post"]
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        required : [true, "Every post should have an author"],
        ref : "user",
    },
    image : {
        type : String
    },
    article : {
        type : String,
        required : [true, "Post cannot be empty"]
    },
    comment : [commentSchema],
    likes : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            }
        }
    ],
    dislikes : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            }
        }
    ],
    reports :[
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user"
            },
            report : {
                type : String,
                required : [true, "Make a valid reason as to why you are reporting the post"]
            }
        }
    ],

},
    {timestamps : true}
)

module.exports = mongoose.model("post", postSchema)