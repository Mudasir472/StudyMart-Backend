const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken')
const key = "MySecretOkDontTouch";
const userSchema = new Schema({
    fullname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true
    },
    number: {
        type: Number,
        require: true
    },
    biography: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    facebookLink: {
        type: String,
        require: true
    },
    instaLink: {
        type: String,
        require: true
    },
    linkedinLink: {
        type: String,
        require: true
    },
    githubLink: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    skills: [
        {
            type: String,
        }
    ],
    password: {
        type: String,
        require: true
    },
    confirmPassword: {
        type: String,
        require: true
    },
    role: {
        type: String,
        require: true
    },
    image: {
        imgName: String,
        url: {
            default: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            type: String,
        }
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cource",
        },
    ],
    // Only for teacher
    courses: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Cource"
                }
            ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
},
    { timestamps: true });

userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, key, { expiresIn: '5d' })
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (error) {

    }
}


const User = mongoose.model("User", userSchema);
module.exports = User;