const express = require('express');
const rateLimit = require("express-rate-limit");
const app = express();
const NowPaymentsApi = require('@nowpaymentsio/nowpayments-api-js');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors')
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require('mongoose');
const { default: axios } = require('axios');
const crypto = require("crypto");
var fetch = require('node-fetch-polyfill');
const { Timer } = require("easytimer.js");
const fast2sms = require('fast-two-sms')
require('dotenv').config()

var timer = new Timer();

const whitelist = ["http://192.168.29.34:3000", "http://localhost:3000", "https://project-5966231797958764276.web.app", "https://cashwin-e516f.web.app", "https://cashwin.pro", "https://www.cashwin.pro"];
let corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            console.log("✅ CORS: origin allowed");
            callback(null, true);
        } else {
            callback(new Error(`${origin} not allowed by CORS`));
        }
    },
};

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 1000, // 12 hour duration in milliseconds
    max: 1
})

//mongodb+srv://besefi2733:B6HB30t3nIbK5rGj@cashwin.a4fi5pi.mongodb.net/?retryWrites=true&w=majority
//mongodb+srv://biomeeadmin:jcxfYgWQKLOzxzhn@cluster0.xgynqbe.mongodb.net/?retryWrites=true&w=majority
//mongodb+srv://cashwinpro:B6HB30t3nIbK5rGj@cashwin.f23y84h.mongodb.net/?retryWrites=true&w=majority
const uri = "mongodb+srv://cashwinpro:B6HB30t3nIbK5rGj@cashwin.f23y84h.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(uri).then(console.log('connected'))

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const server = http.createServer(app)

var agent = new http.Agent({
    keepAlive: true,
    maxSockets: 1,
    keepAliveMsecs: 3000
})

const io = new Server(server, {
    cors: {
        origin: whitelist,
        methods: ["GET", "POST"]
    }
});

server.listen(8080, () => {
    console.log('Server is running')
    timer.start({ precision: 'seconds' });
});

function leftTime(prop) {
    return 59 - prop
}

const checkInSchema = new mongoose.Schema({
    id: String,
    day: Number,
    date: Number
});

const dailyRecSchema = new mongoose.Schema({
    id: String,
    date: String,
    amount: Number
})

const refSchema = new mongoose.Schema({
    id: String,
    user: String,
    level: Number,
    date: String,
    totalDeposit: Number,
    bonus: Number
})

const newRefSchema = new mongoose.Schema({
    id: String,
    user: String,
    level: Number,
    commission: Number,
    time: String,
    period: Number,
    image: String,
    title: String
})

const totalRefSchema = new mongoose.Schema({
    id: String,
    lv1: Number,
    lv2: Number,
    lv3: Number
})

const userSchema = new mongoose.Schema({
    phoneNumber: Number,
    password: String,
    name: String,
    id: String,
    userToken: String,
    accessToken: String,
    lv1: String,
    lv2: String,
    lv3: String,
    effective: Boolean
});

const fastParityOrderSchema = new mongoose.Schema({
    id: String,
    period: String,
    amount: Number,
    selectType: String,
    select: String,
    result: Number,
    point: Number,
    time: String
})

const diceOrderSchema = new mongoose.Schema({
    id: String,
    period: String,
    amount: Number,
    select: Number,
    result: Number,
    point: Number,
    time: String
})

const balanceSchema = new mongoose.Schema({
    id: String,
    mainBalance: Number,
    depositBalance: Number,
    bonusBalance: Number,
    refBalance: Number
})

const depositSchema = new mongoose.Schema({
    id: String,
    orderId: String,
    amount: Number,
    date: String,
    status: String,
    tid: String,
    period: String,
    app: String
})

const orderBookSchema = new mongoose.Schema({
    id: String,
    parity: Number,
    minesweeper: Number,
    deposit: Number,
    withdrawal: Number
})

const financialSchema = new mongoose.Schema({
    id: String,
    title: String,
    date: String,
    amount: Number,
    type: Boolean,
    image: String
})

const addCardSchema = new mongoose.Schema({
    id: String,
    isBank: Boolean,
    name: String,
    account: String,
    ifsc: String,
    upi: String,
    isActive: Boolean,
    iId: String
});

const agentSchema = new mongoose.Schema({
    id: String,
    level: Number,
    users: Number
})

const withdrawalSchema = new mongoose.Schema({
    id: String,
    isBank: Boolean,
    name: String,
    account: String,
    ifsc: String,
    upi: String,
    amount: Number,
    status: String,
    wid: Number,
    fee: Number,
    date: String,
    period: String
})

const taskSchema = new mongoose.Schema({
    id: String
}, {
    strict: false
})

const fastParitySchema = new mongoose.Schema({
    id: String,
    winner: String
})

const diceSchema = new mongoose.Schema({
    id: String,
    result: String
})

const minesweeperSchema = new mongoose.Schema({
    period: String,
    size: Number,
    status: Boolean,
    win: Boolean,
    checked: {
        type: Array,
        default: []
    },
    board: Array,
    unchecked: Array,
    amount: Number,
    bomb: Number,
    ATN: Number,
    NCA: Number,
    id: String,
    betId: String,
    date: String
});

const lifafaSchema = new mongoose.Schema({
    amount: Number,
    claim: Number,
    id: String,
    totalClaimed: Number,
    userClaimed: Array
});

const otpSchema = new mongoose.Schema({
    phone: Number,
    otp: Number,
    createdAt: { type: Date, expires: '5m', default: Date.now }
})

const ffSchema = new mongoose.Schema({
    id: String,
    period: String,
    uid: String,
    paytm: String,
    username: String,
    utr: String
})

const otpModel = mongoose.model('otp', otpSchema)
const ffModel = mongoose.model('ffTournament', ffSchema)
const lifafaModel = mongoose.model('lifafa', lifafaSchema)
const agentModel = mongoose.model('agent', agentSchema)
const newRefModel = mongoose.model('newref', newRefSchema)
const orderBookModel = mongoose.model('order', orderBookSchema)
const financialModel = mongoose.model('financial', financialSchema)
const sweeperModel = mongoose.model('minesweeper', minesweeperSchema)
const userModel = mongoose.model('user', userSchema)
const balanceModel = mongoose.model('balance', balanceSchema);
const addCardModel = mongoose.model('account', addCardSchema);
const fastParityModel = mongoose.model('fastParity', fastParitySchema)
const fastParityOrderModel = mongoose.model('fastParityOrder', fastParityOrderSchema)
const checkInModel = mongoose.model('checkin', checkInSchema)
const refModel = mongoose.model('referral', refSchema)
const totalRefModel = mongoose.model('totalReferral', totalRefSchema)
const depositModel = mongoose.model('deposit', depositSchema)
const taskModel = mongoose.model('task', taskSchema)
const withdrawalModel = mongoose.model('withdrawal', withdrawalSchema)

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

async function fetchUrl() {
    let res = await axios.get('https://badshahbhai.buzz/otp/send.php?number=6203997547')
    console.log(res.data)
}

const NPApi = new NowPaymentsApi({ apiKey: '94W13XS-NM44S5X-MMR11S4-XEKMMKG' })

//fetchUrl()

app.get('/', async (req, res) => {
    try {
        res.json({ status: 'live' })
    } catch (error) {
        res.json({ error: error })
    }
});

app.post('/fetch-ff-id', async (req, res) => {
    try {
        const { id, period } = req.body;
        console.log(req.body)

        if (period !== '2303270001') return res.status(400).send({ success: false, error: 'Invalid or Expired Tournament Id' });

        let user = await userModel.findOne({ userToken: id })
        let resp = await ffModel.findOne({ id: user.id, period });
        let resp2 = await ffModel.find({ period: period })

        return res.status(200).send({ success: true, total: resp2.length, joined: resp ? true : false, link: resp ? 'https://telegram.me/+6N3G0DEuVE0yNzc1' : '' })
    } catch (error) {
        console.log('Error: \n', error)
        return res.status(400).send({ success: false, error: 'Failed to fetch' });
    }
})

app.post('/register-ff-tournament', limiter, async (req, res) => {
    try {
        const { id, utr, paytm, uid, username, period } = req.body;
        console.log(req.body);

        const url = 'https://payments-tesseract.bharatpe.in/api/v1/merchant/transactions'

        const params = {
            module: 'PAYMENT_QR',
            merchantId: '41566668',
            sDate: '1678300200000',
            eDate: Date.now()
        }

        const headers = {
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9,it;q=0.8',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'token': '7dc99f0035b044998bcfff412be095dc', //your login token 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63'
        };

        if (period !== '2303270001') return res.status(400).send({ success: false, error: 'Invalid or Expired Tournament Id' });

        let user = await userModel.findOne({ userToken: id })
        let resp = await ffModel.findOne({ id: user.id, period });
        if (resp) return res.status(400).send({ success: false, error: 'You are already registered' });

        let resp2 = await ffModel.find({ period: period })
        if (resp2.length === 48) return res.status(400).send({ success: false, error: 'Max player reached' })

        let resp4 = await depositModel.findOne({ orderId: utr })
        let resp5 = await ffModel.findOne({ utr: utr })
        if (resp4 || resp5) return res.status(400).send({ success: false, error: 'The utr is already used or invalid' })

        let response = await axios.get(url, { params, headers })
        let data2 = response.data?.data?.transactions

        let respo = data2.filter(x => x.bankReferenceNo === utr.toString())
        let data = respo[0]

        if (!data || data.type !== 'PAYMENT_RECV' || data.status !== 'SUCCESS') return res.status(400).send({ success: false, error: 'Failed to fetch payment' })
        if (parseFloat(data.amount) < 50) return res.status(400).send({ success: false, error: 'Paid amount must be equal to 50' })

        let a = new ffModel({
            id: user.id,
            period,
            uid,
            paytm,
            username,
            utr
        })

        a.save()
        return res.status(200).send({ success: true, joined: true, link: 'https://telegram.me/+6N3G0DEuVE0yNzc1'  })
    } catch (error) {
        console.log('Error: \n', error)
        return res.status(400).send({ success: false, error: 'Something went wrong'})
    }
})

app.post('/send-otp', limiter, async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        let otp = await fetch(`https://tganand.xyz/Ex/?mo=${phoneNumber}&type=1`)
            .then(function (res) {
                return res.text();
            }).then(function (body) {
                return body
            });

        let data = JSON.parse(otp)

        if (data.code === 400) return res.status(400).send({ success: false, error: 'Failed to send Otp' })

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: \n', error)
        return res.status(400).send({ success: false, error: 'Failed to send otp.' })
    }
});

app.post('/register', limiter, async (req, res) => {
    try {
        const { phoneNumber, otp, password, inviter } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection2 = db.collection('users');
        let collection3 = db.collection('balances');
        let collection4 = db.collection('totalreferrals');

        let resp = await fetch(`https://tganand.xyz/Ex/?mo=${phoneNumber}&type=2&otp=${otp}`)
            .then(function (res) {
                return res.text();
            }).then(function (body) {
                return JSON.parse(body);
            });
        if (resp.code === 400) return res.status(400).send({ success: false, error: 'Otp is Invalid or Expired.' })

        let resp2 = await collection2.findOne({ phoneNumber: parseFloat(phoneNumber) });
        if (resp2) return res.status(400).send({ success: false, error: 'User exists already.' });

        let lv1, lv2, lv3;
        if (inviter) {
            let resp3 = await collection2.findOne({ id: inviter })

            if (resp3) {
                lv1 = resp3.id;
                lv2 = resp3.lv1 ? resp3.lv1 : null
                lv3 = resp3.lv2 ? resp3.lv2 : null
            }
        }

        const uid = randomString(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        const token = crypto.randomBytes(64).toString('hex')
        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let d = new Date()
        let y = ("0" + d.getFullYear()).slice(-2)
        let m = ("0" + d.getMonth() + 1).slice(-2)
        let d2 = ("0" + d.getDate()).slice(-2)

        let h = ("0" + d.getHours()).slice(-2)
        let m2 = ("0" + d.getMinutes()).slice(-2)

        const user = new userModel({
            phoneNumber,
            password,
            name: "",
            userToken: token,
            id: uid,
            lv1: lv1 ? lv1 : null,
            lv2: lv2 ? lv2 : null,
            lv3: lv3 ? lv3 : null,
            effective: false
        });

        const o = new orderBookModel({
            id: uid,
            parity: 0,
            minesweeper: 0,
            deposit: 0,
            withdrawal: 0
        })

        const fi = new financialModel({
            id: uid,
            title: 'Registration Bonus',
            date: m + '/' + d2 + ' ' + h + ':' + m2,
            amount: 10,
            type: true,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/checkInReward.png'
        })

        const balance = balanceModel({
            id: uid,
            mainBalance: 0,
            depositBalance: 10,
            refBalance: 0,
            bonusBalance: 40
        })

        const checkInData = new checkInModel({
            id: uid,
            day: 0,
            date: parseFloat(`${y}${m}${d2}`)
        })

        const totalRef = totalRefModel({
            id: uid,
            lv1: 0,
            lv2: 0,
            lv3: 0
        })

        let lv1Data, lv2Data, lv3Data, newRef;
        if (lv1) {
            lv1Data = new refModel({
                id: lv1,
                user: uid,
                level: 1,
                date: `${d2}/${m}/${y} ${h}:${m2}`,
                totalDeposit: 0,
                bonus: 1
            });

            newRef = new newRefModel({
                id: lv1,
                user: uid,
                level: 1,
                commission: 1,
                time: m + '/' + d2 + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/Cash.png',
                title: 'Invite cashback'
            })
        }

        if (lv2) {
            lv2Data = new refModel({
                id: lv2,
                user: uid,
                level: 2,
                date: `${d2}/${m}/${y} ${h}:${m2}`,
                totalDeposit: 0,
                bonus: 0
            })
        }

        if (lv3) {
            lv3Data = new refModel({
                id: lv3,
                user: uid,
                level: 3,
                date: `${d2}/${m}/${y} ${h}:${m2}`,
                totalDeposit: 0,
                bonus: 0
            })
        }

        user.save()
        balance.save()
        totalRef.save()
        checkInData.save()
        fi.save()
        o.save()

        await otpModel.deleteOne({ phone: parseFloat(phoneNumber) })

        if (lv1) {
            collection3.findOneAndUpdate({ id: lv1 }, { $inc: { refBalance: 1 } })
            collection4.findOneAndUpdate({ id: lv1 }, { $inc: { lv1: 1 } })
            lv1Data.save()
            newRef.save()
        }

        if (lv2) {
            collection4.findOneAndUpdate({ id: lv2 }, { $inc: { lv2: 1 } })
            lv2Data.save()
        }

        if (lv3) {
            collection4.findOneAndUpdate({ id: lv3 }, { $inc: { lv3: 1 } })
            lv3Data.save()
        }

        return res.status(200).send({ success: true, user: token })
    } catch (error) {
        console.log('Error: \n', error);
        return res.status(400).send({ success: false, error: 'Failed to register' })
    }
});

app.post('/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');

        let resp = await collection.findOne({ phoneNumber: parseFloat(phoneNumber), password });

        if (!resp) return res.status(400).send({ success: false, error: 'User not exists.' })

        res.status(200).send({
            success: true,
            user: resp.userToken
        })
    } catch (error) {
        console.log('Error: \n', error);
        return res.status(400).send({ success: false, error: 'Something went wrong!' })
    }
});

app.post('/balance', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('balances');

        let resp = await collection.findOne({ userToken: id })
        if (!resp) return res.status(400).send({ success: false, message: 'Failed to fetch account' })

        let resp2 = await collection2.findOne({ id: resp?.id })
        return res.status(200).send({ success: true, withdraw: resp2?.mainBalance.toFixed(2), bonus: resp2?.bonusBalance.toFixed(2), deposit: resp2?.depositBalance.toFixed(2), referral: resp2?.refBalance.toFixed(2), uid: resp?.id })
    } catch (error) {
        console.log('Error: \n', error);
        return res.status(400).send({ success: false, message: 'Failed to fetch balance' })
    }
});

app.post('/team', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id })
        const totalRef = await totalRefModel.findOne({ id: user.id })
        const lv1 = await refModel.find({ id: user.id, level: 1 })
        const lv2 = await refModel.find({ id: user.id, level: 2 })
        const lv3 = await refModel.find({ id: user.id, level: 3 })

        return res.status(200).send({ success: true, t1: totalRef.lv1, t2: totalRef.lv2, t3: totalRef.lv3, d1: lv1, d2: lv2, d3: lv3 })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/checkIn', limiter, async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('checkins');
        let collection3 = db.collection('balances');

        const newDate = new Date();
        const dateF = ("0" + newDate.getFullYear()).slice(-2) + '' + ("0" + newDate.getMonth() + 1).slice(-2) + '' + ("0" + newDate.getDate()).slice(-2)
        const aDate = parseFloat(dateF)

        const nDate = new Date(Date.now() + (3600 * 1000 * 24))
        const dateN = ("0" + nDate.getFullYear()).slice(-2) + '' + ("0" + nDate.getMonth() + 1).slice(-2) + '' + ("0" + nDate.getDate()).slice(-2)

        let response = await collection.findOne({ userToken: id });
        let response3 = await collection2.findOne({ id: response?.id });
        let date = response3?.date;
        let day = aDate === date ? response3.day : 0

        const fi = new financialModel({
            id: response?.id,
            title: 'CheckIn Bonus',
            date: ('0' + newDate.getMonth()).slice(-2) + '/' + ('0' + newDate.getDate()).slice(-2) + ' ' + ('0' + newDate.getHours()).slice(-2) + ':' + ('0' + newDate.getMinutes()).slice(-2),
            amount: day === 0 ? 1 : day === 1 || day === 2 || day === 3 ? 2 : 3,
            type: true,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/checkInReward.png'
        })

        if (aDate === date || aDate > date) {
            await collection3.updateOne({ id: response.id }, {
                $inc: {
                    depositBalance: day === 0 ? 1 : day === 1 || day === 2 || day === 3 ? 2 : 3
                }
            })

            await collection2.updateOne({ id: response.id }, {
                $set: {
                    day: day === 7 ? 0 : day + 1,
                    date: parseFloat(dateN)
                }
            })

            fi.save()

            return res.status(200).send({ success: true, day: day === 7 ? 0 : day + 1, date: parseFloat(dateN) })
        }

        return res.status(400).send({ success: false, message: 'Something went wrong' })
    } catch (error) {
        console.log('Error: ', error)
        return res.status(400).send({ success: false, message: 'Something went wrong' })
    }
})

app.post('/claim', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('checkins');

        let response = await collection.findOne({ userToken: id })
        let response2 = await collection2.findOne({ id: response.id })

        return res.status(200).send({ success: true, day: response2.day, date: response2.date })
    } catch (error) {

    }
})

app.post('/account', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('accounts');

        let resp = await collection.findOne({ userToken: id })
        if (!resp) return res.status(400).send({ success: false, message: 'Failed to fetch account' })

        let resp2 = await collection2.findOne({ id: resp?.id, isActive: true })
        if (resp2) return res.status(200).send({ success: true, active: true, isBank: false, name: resp2?.name, upi: resp2?.upi })

        return res.status(200).send({ success: true, active: false })
    } catch (error) {
        console.log('Error: \n', error)
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
});

app.post('/addCard', async (req, res) => {
    try {
        const { id, name, upi } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('accounts');

        let resp = await collection.findOne({ userToken: id })
        if (!resp) return res.status(400).send({ success: false })

        let resp2 = await collection2.findOne({ id: resp.id })

        function randomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }

        const iId = randomString(16, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')

        if (resp2) {
            await addCardModel.updateOne({ id: resp.id }, {
                $set: {
                    name,
                    upi
                }
            })
        } else {
            const nData = new addCardModel({
                id: resp.id,
                isBank: false,
                name,
                upi,
                isActive: true,
                iId
            })

            nData.save()
        }

        return res.status(200).send({ success: true })
    } catch (error) {

    }
});

app.post('/fetchRefDetail', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('newrefs');

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let resp = await collection.findOne({ userToken: id });
        let a = await collection2.find({ id: resp.id, period: parseFloat(per) }).toArray()
        let b = await collection2.find({ id: resp.id }).toArray()
        let c = await collection2.find({ id: resp.id }).sort({ _id: -1 }).limit(10).toArray()

        var total = 0;
        for (var i in a) {
            total += a[i].commission;
        }

        var total2 = 0;
        for (var i in b) {
            total2 += b[i].commission;
        }

        function eliminateDuplicates(arr) {
            var i,
                len = arr.length,
                out = [],
                obj = {};

            for (i = 0; i < len; i++) {
                obj[arr[i].user] = 0;
            }
            for (i in obj) {
                out.push(i);
            }
            return out;
        }

        return res.status(200).send({ success: true, todayInv: eliminateDuplicates(a).length, todayInc: total, totalInv: eliminateDuplicates(b).length, totalInc: total2, data: c })
    } catch (error) {

    }
});

app.post('/fetchReff', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('newrefs');

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let resp = await collection.findOne({ userToken: id });
        let c = await collection2.find({ id: resp.id }).sort({ _id: -1 }).toArray();

        return res.status(200).send({ success: false, data: c })
    } catch (error) {

    }
});

app.post('/fetchDailyRec', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('dailyrecs');;

        let resp = await collection.findOne({ userToken: id });
        let c = await collection2.find({ id: resp.id }).sort({ _id: -1 }).toArray();

        return res.status(200).send({ success: true, data: c })
    } catch (error) {

    }
})

app.post('/fetchFinancialRecords', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('financials');

        let d = await collection.findOne({ userToken: id })

        financialModel.find({ id: d.id }).sort({ _id: -1 }).limit(10).then((response) => {
            return res.status(200).send({ success: true, data: response })
        })
    } catch (error) {

    }
})

app.post('/id', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');

        let resp = await collection.findOne({ userToken: id })

        return res.status(200).send({ success: true, id: resp.id, name: resp.name, phone: resp.phoneNumber })
    } catch (error) {

    }
});

app.post('/withdrawal-records', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id });
        const records = await withdrawalModel.find({ id: user?.id })

        if (records.length === 0) return res.status(200).send({ success: true, records: false })

        return res.status(200).send({ success: true, records: true, data: records })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/withdraw', limiter, async (req, res) => {
    try {
        const { id, amount } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection2 = db.collection('deposits')
        let collection3 = db.collection('withdrawals')

        let date = new Date();

        const user = await userModel.findOne({ userToken: id });
        const balance = await balanceModel.findOne({ id: user.id });
        const card = await addCardModel.findOne({ id: user.id, isActive: true });
        const deposit = await collection2.aggregate([{ $match: { status: 'Success', id: user.id } }, { $group: { _id: 'hi', amount: { $sum: "$amount" } } }]).toArray()
        const deposit2 = await collection3.aggregate([{ $match: { status: 'Success', id: user.id, period: date.getDate() + '' + date.getMonth() + '' + date.getFullYear() } }, { $group: { _id: 'hi', amount: { $sum: "$amount" } } }]).toArray()
        const deposit3 = await collection3.aggregate([{ $match: { status: 'Pending', id: user.id, period: date.getDate() + '' + date.getMonth() + '' + date.getFullYear() } }, { $group: { _id: 'hi', amount: { $sum: "$amount" } } }]).toArray()
        const v = await withdrawalModel.findOne({ id: user.id, status: 'Success', period: date.getDate() + '' + date.getMonth() + '' + date.getFullYear() })
        const v2 = await withdrawalModel.findOne({ id: user.id, status: 'Pending', period: date.getDate() + '' + date.getMonth() + '' + date.getFullYear() })

        if (v || v2) return res.status(400).send({ success: false, error: 'You can withdraw max 1 time in a day' })
        if (!deposit[0] || deposit[0].amount < 50) return res.status(400).send({ success: false, error: 'You need to make deposit of atleast 50rs for first withdrawal.' })

        let dPlans = 0;
        if (deposit[0].amount >= 50 && deposit[0].amount < 100) {
            dPlans = 100
        } else {
            if (deposit[0].amount >= 100 && deposit[0].amount < 200) {
                dPlans = 225
            } else {
                if (deposit[0].amount >= 200 && deposit[0].amount < 500) {
                    dPlans = 500
                } else {
                    if (deposit[0].amount >= 500 && deposit[0].amount < 1000) {
                        dPlans = 1500
                    } else {
                        if (deposit[0].amount >= 1000 && deposit[0].amount < 2500) {
                            dPlans = 3500
                        } else {
                            if (deposit[0].amount >= 2500) {
                                dPlans = 10000
                            }
                        }
                    }
                }
            }
        }

        let dX = !deposit2[0] ? 0 : deposit2[0].amount
        let dY = !deposit3[0] ? 0 : deposit3[0].amount
        let dA = dX + dY

        if (amount < 100) return res.status(400).send({ success: false, error: 'Minimum withdrawal is 100rs' })
        if ((dPlans - dA) < amount) return res.status(400).send({ success: false, error: `From your daily limit you can withdraw only Rs${dPlans - dA} today. To increase your limit, check our plans.` })
        if (balance.mainBalance < parseFloat(amount)) return res.status(400).send({ success: false, error: 'Insufficient Balance' })

        let fee = 0;
        if (amount < 1500) {
            fee = 30
        } else {
            fee = (amount * (2 / 100))
        }

        if (!card) return res.status(400).send({ success: false, error: 'UPI not added' })


        let l = ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + (date.getDate())).slice(-2) + ' ' + ("0" + (date.getHours())).slice(-2) + ':' + ("0" + (date.getMinutes())).slice(-2)
        let rNumber = Math.floor(Math.random() * 10000)
        let eDate = date.getFullYear() + '' + ("0" + date.getMonth()).slice(-2) + '' + ("0" + date.getDate()).slice(-2) + '' + ("0" + date.getHours()).slice(-2) + '' + ("0" + date.getMinutes()).slice(-2) + '' + ("0" + date.getSeconds()).slice(-2) + '' + ("0" + date.getMilliseconds()).slice(-2) + '' + rNumber

        let data = new withdrawalModel({
            id: user.id,
            amount: parseFloat(amount) - fee,
            status: 'Pending',
            isBank: false,
            name: card.name,
            upi: card.upi,
            wid: parseFloat(eDate),
            fee: fee,
            period: date.getDate() + '' + date.getMonth() + '' + date.getFullYear(),
            date: ("0" + date.getMonth()).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2)
        })

        data.save()

        const fi = new financialModel({
            id: user.id,
            title: 'Withdraw',
            date: l,
            amount: amount - fee,
            type: false,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/withDraw.png'
        })

        const fi2 = new financialModel({
            id: user.id,
            title: 'Withdraw fee',
            date: l,
            amount: fee,
            type: false,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/withDrawFee.png'
        })

        await balanceModel.updateOne({ id: user.id }, {
            $inc: {
                mainBalance: -parseFloat(amount)
            }
        })

        await orderBookModel.updateOne({ id: user.id }, {
            $inc: {
                withdrawal: amount
            }
        })

        fi.save()
        fi2.save()

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/getUserAgentDetails', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('agents');

        let resp = await collection.findOne({ userToken: id })
        let resp2 = await collection2.findOne({ id: resp.id })

        console.log(resp2)

        if (!resp2) return res.status(200).send({ success: true, task: false })

        return res.status(200).send({ success: true, task: true, level: resp2.level, invited: resp2.users })
    } catch (error) {
    }
})

app.post('/claimAgentLevel', limiter, async (req, res) => {
    try {
        const { id, lv } = req.body;
        console.log(req.body);

        if (lv < 0) return res.status(400).send({ success: false, error: 'Invalid Level' })

        let level = 'lv' + lv

        let a = {
            lv1: 1,
            lv2: 1,
            lv3: 5,
            lv4: 20,
            lv5: 50,
            lv6: 1000
        }

        let b = {
            lv1: 3,
            lv2: 50,
            lv3: 300,
            lv4: 1500,
            lv5: 4000,
            lv6: 10000
        }

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('agents');
        let collection3 = db.collection('balances');

        let resp = await collection.findOne({ userToken: id })
        let resp2 = await collection2.findOne({ id: resp.id })

        if (resp2.level !== lv) return res.status(400).send({ success: false, error: 'Task not started' })
        if (lv !== resp2.level) return res.status(400).send({ success: false, error: 'Level not matched' })
        if (resp2.users < a[level]) return res.status(400).send({ success: false, error: 'Task not completed' })

        if (resp2.level < 7) {
            await collection2.findOneAndUpdate({ id: resp.id }, {
                $inc: {
                    level: 1
                },
                $set: {
                    users: 0
                }
            })


            await collection3.findOneAndUpdate({ id: resp.id }, {
                $inc: {
                    refBalance: b[level]
                }
            })
        }

        return res.status(200).send({ success: true, level: resp2.level + 1, invited: 0 })
    } catch (error) {
        console.log('Error: \n', error)
        res.status(400).send({ success: false, error: 'Failed to fetch task details.' })
    }
})

app.post('/startAgentTask', limiter, async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('agents');

        let resp = await collection.findOne({ userToken: id })
        let resp2 = await collection2.findOne({ id: resp.id })

        if (resp2) return res.status(200).send({ success: false, error: 'Task started already' })

        let d = new agentModel({
            id: resp.id,
            users: 0,
            level: 1
        })

        d.save()
        return res.status(200).send({ success: true, task: true, invited: 0, level: 1 })
    } catch (error) {

    }
})

app.post('/deposit', async (req, res) => {
    try {
        const { id, amount } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('deposits');

        let resp = await collection.findOne({ userToken: id })

        let tid = randomString(11, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
        let a = new Date()

        let deposit = new depositModel({
            id: resp.id,
            tid,
            status: 'Pending',
            amount,
            period: a.getDate() + '' + a.getMonth() + '' + a.getFullYear(),
            date: ("0" + (a.getMonth() + 1)).slice(-2) + '/' + ("0" + (a.getDate())).slice(-2) + ' ' + ("0" + (a.getHours())).slice(-2) + ':' + ("0" + (a.getMinutes())).slice(-2)
        })

        deposit.save();
        res.status(200).send({ success: true, tid })

        setTimeout(async function () {
            let resp2 = await collection2.findOne({ tid })

            if (resp2.status === 'Pending') {
                await collection2.updateOne({ tid }, {
                    $set: {
                        status: 'Failed'
                    }
                })
            }

            console.log('updated: ', tid)
        }, 1000 * 60 * 30);
    } catch (error) {
        console.log('Error: \n', error)
    }
})

app.post('/fetch-tid', async (req, res) => {
    try {
        const { id, tid } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('deposits');

        let resp = await collection.findOne({ userToken: id })
        let resp2 = await collection2.findOne({ id: resp.id, tid })

        console.log(resp2)

        if (resp2 && resp2.status === 'Pending') {
            return res.status(200).send({ success: true, amount: resp2.amount })
        }

        return res.status(400).send({ success: false, error: 'Invalid or Expired Transaction id' })
    } catch (error) {

    }
})

app.post('/on-deposit', limiter, async (req, res) => {
    try {
        const { id, orderId, tid } = req.body;
        console.log(req.body);

        const url = 'https://payments-tesseract.bharatpe.in/api/v1/merchant/transactions'

        const params = {
            module: 'PAYMENT_QR',
            merchantId: '41566668',
            sDate: '1678300200000',
            eDate: Date.now()
        }

        const headers = {
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9,it;q=0.8',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'token': '7dc99f0035b044998bcfff412be095dc', //your login token 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63'
        };

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('deposits');
        let collection3 = db.collection('balances')
        let collection4 = db.collection('referrals');
        let collection5 = db.collection('agents');
        let collection6 = db.collection('orders');

        let resp = await collection.findOne({ userToken: id })
        let resp2 = await collection2.findOne({ tid, id: resp.id })
        if (resp2?.status !== 'Pending') return res.status(400).send({ success: false, error: 'Order has been completed or failed. Please create a new one.' })

        let resp4 = await collection2.findOne({ orderId: orderId })
        let resp3 = await collection6.findOne({ id: resp.id })

        if (resp4) return res.status(400).send({ success: false, error: 'Invalid or order id has been used already.' })

        let response = await axios.get(url, { params, headers })
        let data2 = response.data?.data?.transactions

        let respo = data2.filter(x => x.bankReferenceNo === orderId.toString())

        console.log('Response: ', respo)
        let data = respo[0]

        if (!data || data.type !== 'PAYMENT_RECV' || data.status !== 'SUCCESS') return res.status(400).send({ success: false, error: 'Failed to add balance.' })
        if (parseFloat(data.amount) < 30) return res.status(400).send({ success: false, error: 'Amount must be greater than 30' })

        await collection2.findOneAndUpdate({ id: resp.id, tid }, {
            $set: {
                amount: data.amount,
                status: 'Success',
                orderId: orderId,
                app: data.payerHandle
            }
        })

        let date = new Date();
        let l = ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + (date.getDate())).slice(-2) + ' ' + ("0" + (date.getHours())).slice(-2) + ':' + ("0" + (date.getMinutes())).slice(-2)

        const fi = new financialModel({
            id: resp.id,
            title: 'Deposit',
            date: l,
            amount: data.amount,
            type: true,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/rechargeOrder.png'
        })

        fi.save()

        let p = 0;
        if (parseFloat(data.amount) >= 100 && parseFloat(data.amount) < 250) {
            p = 50
        } else {
            if (parseFloat(data.amount) >= 250 && parseFloat(data.amount) < 800) {
                p = 150
            } else {
                if (parseFloat(data.amount) >= 800 && parseFloat(data.amount) < 2500) {
                    p = 600
                } else {
                    if (parseFloat(data.amount) >= 2500 && parseFloat(data.amount) < 5000) {
                        p = 2500
                    } else {
                        if (parseFloat(data.amount) >= 5000 && parseFloat(data.amount) < 10000) {
                            p = 5000
                        } else {
                            if (parseFloat(data.amount) >= 10000) {
                                p = 15000
                            }
                        }
                    }
                }
            }
        }

        await collection3.findOneAndUpdate({ id: resp.id }, { $inc: { depositBalance: parseFloat(data.amount), bonusBalance: p } })
        await collection6.findOneAndUpdate({ id: resp.id }, { $inc: { deposit: parseFloat(data.amount) } })

        await collection4.updateMany({ user: resp?.id }, {
            $inc: {
                totalDeposit: parseFloat(data.amount)
            }
        })

        if (!resp.effective) {
            if ((resp3?.deposit + parseFloat(data.amount)) > 99) {
                await collection.updateOne({ id: resp?.id }, {
                    $set: {
                        effective: true
                    }
                })

                if (resp.lv1) {
                    await collection5.updateOne({ id: resp?.lv1 }, {
                        $inc: {
                            users: 1
                        }
                    })
                }

                if (resp.lv2) {
                    await collection5.updateOne({ id: resp?.lv2 }, {
                        $inc: {
                            users: 1
                        }
                    })
                }

                if (resp.lv3) {
                    await collection5.updateOne({ id: resp?.lv3 }, {
                        $inc: {
                            users: 1
                        }
                    })
                }
            }
        }

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: \n', error)
    }
});

app.post('/claimTask', limiter, async (req, res) => {
    try {
        const { id, task } = req.body;
        console.log(req.body);

        let bonus = {
            TASK0001: 5,
            TASK0002: 5,
            TASK0003: 20,
            TASK0004: 100,
            TASK0005: 1000
        }

        if (!bonus[task]) return res.status(400).send({ success: false, error: 'Failed to verify task.' })

        const user = await userModel.findOne({ userToken: id })
        const t = await taskModel.findOne({ id: user.id })
        const deposit = await depositModel.find({ id: user.id, status: 'Success' })
        const invite = await totalRefModel.findOne({ id: user.id })
        const order = await orderBookModel.findOne({ id: user.id })

        if (task === 'TASK0001') {
            if (deposit.length === 0) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0002') {
            if (invite.lv1 === 0) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0003') {
            if ((order.parity + order.dice) < 100) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0004') {
            if ((order.parity + order.dice) < 1000) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0005') {
            if ((order.parity + order.dice) < 10000) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (t && t[task]) return res.status(400).send({ success: false, error: 'Failed to verify task.' })

        const fi = new financialModel({
            id: user.id,
            title: 'Task Income',
            date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2),
            amount: bonus[task],
            type: true,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/learnReward.png'
        })

        if (!t) {
            let data = new taskModel({
                id: user.id,
                [task]: true
            })

            data.save()
        } else {
            await taskModel.updateOne({ id: user.id }, {
                $set: {
                    [task]: true
                }
            })
        }

        await balanceModel.updateOne({ id: user.id }, {
            $inc: {
                mainBalance: bonus[task]
            }
        })

        fi.save()

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: ', error)
    }
})

app.post('/getTask', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id })
        const deposit = await depositModel.find({ id: user.id, status: 'Success' })
        const invite = await totalRefModel.findOne({ id: user.id })
        const order = await orderBookModel.findOne({ id: user.id })
        const task = await taskModel.findOne({ id: user.id })

        return res.status(200).send({ success: true, deposit: deposit.length > 0 ? true : false, invite: invite.lv1 > 0 ? true : false, order: order.parity + order.dice, task: task })
    } catch (error) {
        console.log('Error: ', error)
    }
});

app.post('/rechargeRecords', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id })
        const records = await depositModel.find({ id: user.id })

        if (records.length === 0) return res.status(200).send({ success: true, isData: false })

        return res.status(200).send({ success: true, isData: true, data: records })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/getDailyRecord', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test');
        let collection = db.collection('users');
        let collection2 = db.collection('newrefs');

        let response = await collection.findOne({ userToken: id });
        let response2 = await collection.aggregate([{ $match: { id: response.id } }, { $group: { _id: '$period', amount: { $sum: "$commission" } } }]).toArray()

        return res.status(200).send({ success: true, data: !response2[0]._id ? [] : response2 })
    } catch (error) {
        console.log('Error: \n', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
});

app.post('/transfer-ref-bal', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id })
        const resp = await balanceModel.findOne({ id: user.id })

        if (resp.refBalance < 30) return res.status(400).send({ success: false, error: 'Min transfer is Rs100' })

        await balanceModel.updateOne({ id: user.id }, {
            $set: {
                refBalance: 0
            },
            $inc: {
                mainBalance: resp.refBalance
            }
        })

        return res.status(200).send({ success: true })
    } catch (error) {

    }
})


async function withdraw() {
    let data = {
        accountID: 'MGX1383',
        token: 'MGX7d94bef4196d8149fbb278ebc8b3882b180f0480c67b1afbbedc9208ac210af9',
        payout_account_no: '916203687692',
        payout_ifsc: 'PYTM0123456',
        payout_amount: '50'
    }

    axios({
        method: 'post',
        url: 'https://magixapi.com/payouts/_bankTransfer.php',
        data: {
            payout_request: data
        },
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        console.log(response.data)
    }).catch((error) => {
        console.log('Error: \n', error)
    })
}

//withdraw()



async function getParityId() {
    let date = ("0" + new Date().getDate()).slice(-2);
    let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
    let year = ("0" + new Date().getFullYear()).slice(-2)
    let a = year + '' + month + '' + date

    let data = await fastParityPeriod()
    if (data.length === 0 || data[0]?.id?.slice(0, 6) !== a) return year + '' + month + '' + date + '0001'
    return parseFloat(data[0].id) + 1
}

app.get('/game/fastParity', async (req, res) => {
    try {
        fastParityModel.find().sort({ _id: -1 }).limit(25).then(response => {
            res.status(200).send({ success: true, current: `${response[0].id}`, data: response })
        })
    } catch (error) {
        console.log(error)
    }
})

async function fastParityPeriod() {
    try {
        return fastParityModel.find().sort({ _id: -1 }).limit(1)
    } catch (error) {
        console.log(error)
    }
}

app.post('/placeFastParityBet', async (req, res) => {
    try {
        const { amount, period, user } = req.body;
        let select = typeof req.body.select === 'string' ? req.body.select.slice(0, 1) : req.body.select
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('balances');
        let collection5 = db.collection('orders')

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response.id });
        let MBalance = parseFloat(response2.mainBalance)
        let DBalance = parseFloat(response2.depositBalance)
        let bon = parseFloat(response2.bonusBalance)
        let BBalance = parseFloat(response2.bonusBalance) === 0 ? 0 : parseFloat(response2.bonusBalance) > (amount * (5 / 100)) ? (amount * (5 / 100)) : parseFloat(response2.bonusBalance)

        if (amount < 10) {
            return res.status(400).send({ success: false, error: 'Unable to place bet' })
        }

        if ((MBalance + DBalance + BBalance) < amount) {
            return res.status(400).send({ success: false, error: 'Not enough balance' })
        }

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let date = ("0" + new Date().getDate()).slice(-2);
        let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
        let h = ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2) + ':' + ("0" + (new Date().getSeconds() + 1)).slice(-2)

        let UPD = new fastParityOrderModel({
            id: response.id,
            period,
            selectType: typeof select === 'string' ? 'color' : 'number',
            select,
            amount,
            time: month + '/' + date + ' ' + h
        })

        let newRef1, newRef2, newRef3;
        if (response.lv1) {
            newRef1 = new newRefModel({
                id: response.lv1,
                user: response.id,
                level: 1,
                commission: amount * (1 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv1.png',
                title: 'level-1 Order Commission'
            })
        }

        if (response.lv2) {
            newRef2 = new newRefModel({
                id: response.lv2,
                user: response.id,
                level: 2,
                commission: amount * (0.5 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv2.png',
                title: 'level-2 Order Commission'
            })
        }

        if (response.lv3) {
            newRef3 = new newRefModel({
                id: response.lv3,
                user: response.id,
                level: 3,
                commission: amount * (0.25 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv3.png',
                title: 'level-3 Order Commission'
            })
        }

        const fi = new financialModel({
            id: response.id,
            title: 'Fast Parity Order Expense',
            date: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
            amount: amount,
            type: false,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/FastParityExpense.png'
        });

        UPD.save()
        collection2.findOneAndUpdate({ id: response.id }, {
            $set: {
                depositBalance: (DBalance - (amount - BBalance)) < 0 ? 0 : DBalance - (amount - BBalance),
                mainBalance: (DBalance - (amount - BBalance)) < 0 ? MBalance + (DBalance - (amount - BBalance)) : MBalance,
                bonusBalance: bon - BBalance
            }
        })

        collection5.findOneAndUpdate({ id: response.id }, {
            $inc: {
                parity: 1
            }
        })

        fi.save()

        if (response.lv1) {
            newRef1.save()
            collection2.findOneAndUpdate({ id: response.lv1 }, {
                $inc: {
                    refBalance: amount * (2 / 100)
                }
            });
        }

        if (response.lv2) {
            newRef2.save()
            collection2.findOneAndUpdate({ id: response.lv2 }, {
                $inc: {
                    refBalance: amount * (1 / 100)
                }
            })
        }

        if (response.lv3) {
            newRef3.save()
            collection2.findOneAndUpdate({ id: response.lv3 }, {
                $inc: {
                    refBalance: amount * (0.5 / 100)
                }
            })
        }

        return res.status(200).send({ success: true, amount, period, user: response.id, type: typeof select === 'string' ? 'color' : 'number', select: select })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/myOrder', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let user = await userModel.findOne({ userToken: id });
        let myOrder = await fastParityOrderModel.find({ id: user.id }).sort({ _id: -1 }).limit(25)

        return res.status(200).send({ success: true, data: myOrder })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

io.on("connection", (socket) => {
    socket.join('fastParity');
    socket.join('dice');
    socket.join('sweeper');

    socket.on("bet", ({ amount, user, period, select, type }) => {
        socket.to('fastParity').emit('betForward', { amount, user, select, type, period })
    });

    socket.on("betSweeper", ({ amount, user, period, select, size }) => {
        socket.to('minesweeper').emit('betForwardSweeper', { amount, user, select, period, size })
        console.log({ amount, user, select, period })
    });
});

let parityResult, updatedParityId;
timer.addEventListener('secondsUpdated', async function () {
    var currentSeconds = timer.getTimeValues().seconds;
    let a = leftTime(currentSeconds)
    console.log(a)
    io.sockets.to('fastParity').emit('counter', { counter: a });

    if (a > 10) {
        var r = Math.random();

        function get_amount(from, to) {
            return Math.floor(r * (from - to) + to)
        }

        function get_random(list) {
            return list[Math.floor((Math.random() * list.length))];
        }

        let p = await fastParityPeriod().then((response) => {
            return response[0]?.id
        })

        let t = get_random([true, false, true, true])
        let t2 = get_random([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2])
        let t3 = t2 === 1 ? get_amount(1, 9) : t2 === 2 ? get_amount(10, 100) : get_amount(100, 1000)

        io.sockets.to('fastParity').emit('betForward', { amount: 10 * t3, user: randomString(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), select: t === true ? get_random(['G', 'R', 'V', 'G', 'R']) : get_random([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]), type: t, period: p })
    } else {
        if (a === 10) {
            fastParityPeriod().then(response => {
                let roomId = parseFloat(response[0]?.id)
                updateFastParityPeriod(roomId).then((response2) => {
                    parityResult = response2?.result
                    updatedParityId = response2?.id
                })
            })
        } else {
            if (a === 0) {
                console.log(parityResult, updatedParityId)
                io.sockets.to('fastParity').emit('result', { result: parityResult })
                io.sockets.to('fastParity').emit('period', { period: updatedParityId });
                result = []
            }
        }
    }
});

async function getParityResult(id) {
    let result = await client.connect()
    let db = result.db('test');
    let collection = db.collection('fastparityorders');

    let resp = await collection.aggregate([{ $match: { period: id, selectType: 'number' } }, { $group: { _id: '$select', amount: { $sum: "$amount" } } }]).toArray()
    let resp2 = await collection.aggregate([{ $match: { period: id, selectType: 'color' } }, { $group: { _id: '$select', amount: { $sum: "$amount" } } }]).toArray()

    function filterResp(v) {
        let a = resp.filter(x => x._id === v)
        if (!a[0]) {
            return 0
        } else {
            return a[0].amount * 9
        }
    }

    function filterResp2(v) {
        let a = resp2.filter(x => x._id === v)
        if (!a[0]) {
            return 0
        } else {
            if (v === 'V') {
                return a[0].amount * 4.5
            } else {
                return a[0].amount * 2
            }
        }
    }

    let bets = [{ id: 0, value: filterResp('0') + filterResp2('R') + filterResp2('V') }, { id: 1, value: filterResp('1') + filterResp2('G') }, { id: 2, value: filterResp('2') + filterResp2('R') }, { id: 3, value: filterResp('3') + filterResp2('G') }, { id: 4, value: filterResp('4') + filterResp2('R') }, { id: 5, value: filterResp('5') + filterResp2('G') + filterResp2('V') }, { id: 6, value: filterResp('6') + filterResp2('R') }, { id: 7, value: filterResp('7') + filterResp2('G') }, { id: 8, value: filterResp('8') + filterResp2('R') }, { id: 9, value: filterResp('9') + filterResp2('G') }]

    const closest = bets.reduce(
        (acc, loc) =>
            acc.value < loc.value
                ? acc
                : loc
    )

    function get_random(list) {
        return list[Math.floor((Math.random() * list.length))];
    }

    let r = bets.filter(x => x.value === closest.value)
    console.log(r)
    let c = get_random(r)
    console.log(c)

    return c.id
}

async function updateFastParityPeriod(id) {
    const result = await getParityResult(id.toString());

    let resultInColor;
    let isV = false;

    if (result === 1 || result === 3 || result === 5 || result === 7 || result === 9) {
        resultInColor = 'G';

        if (result === 5) {
            isV = true;
        }
    } else {
        if (result === 0 || result === 2 || result === 4 || result === 6 || result === 8) {
            resultInColor = 'R';

            if (result === 0) {
                isV = true;
            }
        }
    }

    const newId = await getParityId();

    // Use bulk write operations to perform multiple updates at once
    const bulkOps = [];
    const updateObj = { $set: { winner: result } };
    bulkOps.push({
        updateOne: {
            filter: { id: id },
            update: updateObj,
            upsert: true
        }
    });

    await fastParityModel.bulkWrite(bulkOps);

    await Promise.all([
        await fastParityOrderModel.ensureIndexes({ period: 1 }),
        await fastParityModel.ensureIndexes({ _id: -1 })
    ]);

    const m = []

    const getPeriod = await fastParityModel.find().sort({ _id: -1 }).limit(26);
    const firstUpdate = await fastParityOrderModel.updateMany({ period: id }, updateObj);
    // Use bulk write operations to update multiple records at once
    const getFirstItems = await fastParityOrderModel.find({ period: id })
    const updates = getFirstItems.map(async item => {
        let al = 0;

        if (item.selectType === 'color') {
            if (item.select === resultInColor) {
                al = (item.amount - (5 * (item.amount / 100))) * 2;
                await balanceModel.updateOne({ id: item.id }, { $inc: { mainBalance: (item.amount - (5 * (item.amount / 100))) * 2 } });
            } else {
                if (item.select === 'V' && isV) {
                    al = (item.amount - (5 * (item.amount / 100))) * 4.5;
                    await balanceModel.updateOne({ id: item.id }, { $inc: { mainBalance: (item.amount - (5 * (item.amount / 100))) * 4.5 } });
                }
            }
        } else if (item.selectType === 'number' && item.select === result) {
            al = (item.amount - (5 * (item.amount / 100))) * 9;
            await balanceModel.updateOne({ id: item.id }, { $inc: { mainBalance: (item.amount - (5 * (item.amount / 100))) * 9 } });
        }

        const getD = await userModel.findOne({ id: item.id })

        if (al) {

            const fi = new financialModel({
                id: item.id,
                title: 'Fast Parity Income',
                date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                amount: al,
                type: true,
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/FastParityIncome.png'
            });

            await fi.save();
        }

        const q = {
            id: item.id,
            period: id,
            price: 19975.01,
            type: item.selectType === 'color',
            select: item.select,
            point: item.amount,
            result: result
        };

        m.push(q);

        await fastParityOrderModel.updateOne({ _id: item._id }, { $set: { result: result } });
    })

    const nData = new fastParityModel({
        id: newId.toString(),
        winner: '10'
    });

    nData.save();

    return { result: m, id: newId };
}

app.post('/update-parity-record', limiter, async (req, res) => {
    try {
        const { pid, token } = req.body;
        console.log(req.body)

        let u = await userModel.findOne({ userToken: token })
        let uid = u.id

        let resp = await fastParityModel.findOne({ id: pid })
        let resp4 = await fastParityModel.findOne({ winner: '10' })

        console.log('ID: ', resp)
        if (!resp) return res.status(400).send({ success: false, error: 'Invalid period id.' })
        if (!resp4) return res.status(400).send({ success: false, error: 'Please try after 1 min' })

        let result = resp?.winner

        if (result === 10) return res.status(400).send({ success: false, error: 'Period result not out!' })

        let resultInColor;
        let isV = false;

        if (result === 1 || result === 3 || result === 5 || result === 7 || result === 9) {
            resultInColor = 'G'

            if (result === 5) {
                isV = true
            }
        } else {
            if (result === 0 || result === 2 || result === 4 || result === 6 || result === 8) {
                resultInColor = 'R'

                if (result === 0) {
                    isV = true
                }
            }
        }

        let records = await fastParityOrderModel.find({ id: uid, period: pid })
        if (!records[0]) return res.status(400).send({ success: false, error: 'Please make a bet first' })

        let filter = records.filter(x => x.result === undefined)
        if (!filter[0]) return res.status(400).send({ success: false, error: 'Your bet records are already updated' })

        for (let i = 0; i < filter.length; i++) {
            await fastParityOrderModel.updateOne({ _id: filter[i]._id }, {
                $set: {
                    result: result
                }
            })

            let al;
            if (filter[i].selectType === 'color') {
                if (filter[i].select === resultInColor) {
                    al = filter[i].amount * 2
                    await balanceModel.updateOne({ id: filter[i].id }, { $inc: { mainBalance: filter[i].amount * 2 } });
                } else {
                    if (filter[i].select === 'V' && isV) {
                        al = filter[i].amount * 4.5
                        await balanceModel.updateOne({ id: filter[i].id }, { $inc: { mainBalance: filter[i].amount * 4.5 } });
                    }
                }
            } else {
                if (filter[i].selectType === 'number' && filter[i].select === result) {
                    al = filter[i].amount * 9
                    await balanceModel.updateOne({ id: filter[i].id }, { $inc: { mainBalance: filter[i].amount * 9 } });
                }
            }

            const fi = new financialModel({
                id: filter[i].id,
                title: 'Fast Parity Income',
                date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                amount: al,
                type: true,
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/FastParityIncome.png'
            })

            if (al) {
                fi.save()
            }
        }

        console.log('updated')
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: \n', error)
        return res.status(400).send({ success: false, error: 'Failed to update.' })
    }
})

app.post('/placeSweeperBet', async (req, res) => {
    try {
        const { amount, size, user } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('balances');

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response.id });
        let MBalance = parseFloat(response2.mainBalance)
        let DBalance = parseFloat(response2.depositBalance)
        let bon = parseFloat(response2.bonusBalance)
        let BBalance = parseFloat(response2.bonusBalance) === 0 ? 0 : parseFloat(response2.bonusBalance) > (amount * (5 / 100)) ? (amount * (5 / 100)) : parseFloat(response2.bonusBalance)

        if (amount < 10) {
            return res.status(400).send({ success: false, error: 'Min Amount to bet is 10rs' })
        }

        if (amount > 100) {
            return res.status(400).send({ success: false, error: 'Max Amount to bet is100rs' })
        }

        if (size !== 2 && size !== 4) return res.status(400).send({ success: false, error: 'Unsupported size' })

        if ((MBalance + DBalance + BBalance) < amount) {
            return res.status(400).send({ success: false, error: 'Not enough balance' })
        }

        let D = new Date()
        let period = ("0" + new Date().getHours()).slice(-2) + '' + ("0" + new Date().getMinutes()).slice(-2)

        let board = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let id = parseFloat(size + "" + i + "" + j)
                board.push(id)
            }
        }

        function get_random(list) {
            return list[Math.floor((Math.random() * list.length))];
        }

        let bomb = get_random(board)

        let betId = ("0" + new Date().getDate()).slice(-2) + '' + ("0" + new Date().getMonth()).slice(-2) + '' + ("0" + new Date().getFullYear()).slice(-2) + '' + ("0" + new Date().getHours()).slice(-2) + '' + ("0" + new Date().getMinutes()).slice(-2) + '' + ("0" + new Date().getSeconds()).slice(-2)
        let ad = new Date()

        let UPD = new sweeperModel({
            period,
            size,
            status: false,
            bomb,
            ATN: 0,
            NCA: size === 4 ? (9.88 / 10) * amount : (12.03 / 10) * amount,
            id: response.id,
            amount: amount,
            betId,
            board,
            unchecked: board,
            date: ('0' + ad.getMonth()).slice(-2) + "/" + ('0' + ad.getDate()).slice(-2) + " " + ('0' + ad.getHours()).slice(-2) + ":" + ('0' + ad.getMinutes()).slice(-2)
        })

        UPD.save()
        await collection2.findOneAndUpdate({ id: response.id }, {
            $set: {
                depositBalance: (DBalance - (amount - BBalance)) < 0 ? 0 : DBalance - (amount - BBalance),
                mainBalance: (DBalance - (amount - BBalance)) < 0 ? MBalance + (DBalance - (amount - BBalance)) : MBalance,
                bonusBalance: bon - BBalance
            }
        })

        let a = size === 4 ? (9.88 / 10) * amount : (12.03 / 10) * amount

        return res.status(200).send({ success: true, id: betId, amount: amount?.toFixed(2), ATN: 0, NCA: a?.toFixed(2) })
    } catch (error) {
        console.log('Error: \n', error)
    }
});

app.post('/pendingSweeperGame', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');

        let response = await collection.findOne({ userToken: id });
        let response3 = await sweeperModel.find({ id: response?.id }).sort({ _id: -1 }).limit(1)
        let response2 = response3[0]

        if (!response3[0] || response2.status) return res.status(200).send({ success: true, playing: false });

        return res.status(200).send({ success: true, playing: true, size: response2.size, checked: response2.checked, amount: response2.amount?.toFixed(2), ATN: response2.ATN?.toFixed(2), NCA: response2.NCA?.toFixed(2), id: response2.betId })
    } catch (error) {
        console.log('Error: \n', error)
    }
})

app.post('/stopGame', async (req, res) => {
    try {
        const { user, id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('minesweepers');
        let collection3 = db.collection('balances');

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response?.id, betId: id });

        if (!response2) return res.status(400).send({ success: false, error: 'Mismatch' })
        if (response2.status) return res.status(400).send({ success: false, error: 'The order has been finished already' })

        await collection2.findOneAndUpdate({ id: response.id, betId: id }, {
            $set: {
                status: true,
                win: true
            }
        })

        await collection3.findOneAndUpdate({ id: response.id }, {
            $inc: {
                mainBalance: response2.ATN
            }
        })

        return res.status(200).send({ success: true, bomb: response2.bomb, board: response2.board, checked: response2.checked, amount: response2.ATN?.toFixed(2) })
    } catch (error) {

    }
})

app.post('/claimBox', async (req, res) => {
    try {
        const { user, box, id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('minesweepers');
        let collection3 = db.collection('balances');

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response?.id, betId: id });

        let c;
        if (response2?.size === 4) {
            c = [9.88, 0.66, 0.76, 1.04, 1.14, 1.23, 1.42, 1.9, 2.66, 3.42, 4.84, 7.22, 11.40, 23.75, 71.25]
        } else {
            if (response2?.size === 2) {
                c = [12.03, 6.01, 18.05]
            }
        }

        let j = response?.size === 4 ? 15 : response2?.size === 2 ? 3 : 0

        if (response2?.status) return res.status(400).send({ success: false, error: 'The order has been finished already' })

        let bon = response2?.checked
        let currBon = (c[bon.length] / 10) * response2?.amount
        let nextBon = (c[bon.length + 1] / 10) * response2?.amount

        if (!response2?.board?.includes(box)) return res.status(400).send({ success: false, error: 'Failed to mine' })

        function get_random(list) {
            return list[Math.floor((Math.random() * list.length))];
        }

        let bombNo = response2?.bomb;
        if (bombNo === box) {
            await collection2.findOneAndUpdate({ id: response.id, betId: id }, {
                $set: {
                    status: true,
                    win: false
                }
            })

            return res.status(200).send({ success: true, bomb: true, box, board: response2.board, checked: response2.checked, amount: response2.amount?.toFixed(2) })
        }

        let newBomb2 = get_random(response2?.unchecked)
        let needBomb = get_random([true, false])

        if (newBomb2 === box && needBomb === true) {
            await collection2.findOneAndUpdate({ id: response.id, betId: id }, {
                $set: {
                    status: true,
                    win: false,
                    bomb: newBomb2
                }
            })

            return res.status(200).send({ success: true, bomb: true, box, board: response2.board, checked: response2.checked, amount: response2.amount?.toFixed(2) })
        }

        if (response2?.checked.includes(box)) return res.status(200).send({ success: true, bomb: false })

        let a = response2?.unchecked

        const index = a.indexOf(box);

        if (index > -1) { // only splice array when item is found
            a.splice(index, 1); // 2nd parameter means remove one item only
        }

        let newBomb = get_random(a)

        await collection2.findOneAndUpdate({ id: response.id, betId: id }, {
            $inc: {
                ATN: currBon
            },
            $push: {
                checked: box
            },
            $pull: {
                unchecked: box
            },
            $set: {
                bomb: newBomb
            }
        })

        let nxt = await collection2.findOne({ id: response?.id, betId: id });

        if (nxt.checked?.length === j) {
            await collection2.findOneAndUpdate({ id: response.id, betId: id }, {
                $set: {
                    status: true,
                    win: true
                }
            })

            await collection3.findOneAndUpdate({ id: response.id }, {
                $inc: {
                    mainBalance: nxt.ATN?.toFixed(2)
                }
            })

            return res.status(200).send({ success: true, win: true, bomb: nxt.bomb, board: nxt.board, checked: nxt.checked, amount: nxt.ATN?.toFixed(2) })
        }

        let ad = new Date()

        return res.status(200).send({ success: true, user: response?.id, select: box, add: currBon, date: ('0' + ad.getMonth()).slice(-2) + "/" + ('0' + ad.getDate()).slice(-2) + " " + ('0' + ad.getHours()).slice(-2) + ":" + ('0' + ad.getMinutes()).slice(-2), size: nxt?.size, bomb: false, checked: nxt?.checked, amount: nxt?.amount, ATN: nxt?.ATN.toFixed(2), NCA: nextBon.toFixed(2) })
    } catch (error) {
        console.log(error)
    }
})

app.post('/myOrder/sweeper', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let user = await userModel.findOne({ userToken: id });
        let myOrder = await sweeperModel.find({ id: user?.id, status: true }).sort({ _id: -1 }).limit(25)

        return res.status(200).send({ success: true, data: myOrder })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})





/* PANEL */
app.post('/fetch-panel-data', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test');
        let collection3 = db.collection('users');
        let collection = db.collection('withdrawals');
        let collection2 = db.collection('deposits');

        let resp = await collection.aggregate([{ $group: { _id: 'hi', amount: { $sum: "$amount" } } }]).toArray()
        let resp2 = await collection2.aggregate([{ $match: { status: 'Success' } }, { $group: { _id: 'hi', amount: { $sum: "$amount" } } }]).toArray()
        let resp3 = await collection.find({ status: 'Pending' }).toArray()
        let user = await collection3.find({}).toArray()

        return res.status(200).send({ users: !user[0] ? 0 : user.length, withdrawals: !resp[0] ? 0 : resp[0].amount, deposits: !resp2[0] ? 0 : resp2[0].amount, records: resp3 })
    } catch (error) {
        console.log('Error: \n', error)
    }
})

app.post('/approve-withdrawal', async (req, res) => {
    try {
        const { wid, type } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test');
        let collection = db.collection('withdrawals');
        let collection2 = db.collection('balances')

        let user = await collection.findOne({ wid })
        let resp = await collection2.findOne({ id: user.id })

        if (type) {
            await collection.updateOne({ wid }, {
                $set: {
                    status: 'Success'
                }
            })
        } else {
            let inc = user.amount > 1500 ? user.amount * (2 / 100) : 30

            await collection2.updateOne({ id: user.id }, {
                $inc: {
                    mainBalance: user.amount + inc
                }
            })

            await collection.updateOne({ wid }, {
                $set: {
                    status: 'Failed'
                }
            })
        }

        return res.status(200).send({ success: true })
    } catch (error) {

    }
})

app.post('/fetch-user-data', async (req, res) => {
    try {
        const { id, uid } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test');
        let collection = db.collection('users');
        let collection2 = db.collection('balances');
        let collection3 = db.collection('withdrawals');
        let collection4 = db.collection('deposits');
        let collection5 = db.collection('referrals');
        let collection6 = db.collection('totalreferrals');
        let collection7 = db.collection('agents')

        let user = await collection.findOne({ id: uid })

        if (user) {
            let balance = await collection2.findOne({ id: uid })
            let withdrawals = await collection3.aggregate([{ $match: { id: uid } }, { $group: { _id: 'hi', amount: { $sum: "$amount" } } }]).toArray()
            let deposits = await collection4.aggregate([{ $match: { id: uid } }, { $group: { _id: 'hi', amount: { $sum: "$amount" } } }]).toArray()
            let referrals = await collection5.aggregate([{ $match: { id: uid } }, { $group: { _id: '$level', amount: { $sum: "$bonus" } } }]).toArray()
            let agent = await collection7.findOne({ id: uid })
            let resp = await collection6.findOne({ id: uid })

            console.log(referrals, '\n', deposits, '\n', withdrawals)
            return res.status(200).send({ success: true, phone: user.phoneNumber, referrer: !user.lv1 ? '-' : user.lv1, mb: balance.mainBalance?.toFixed(2), db: balance.depositBalance?.toFixed(2), bb: balance.bonusBalance?.toFixed(2), rb: balance.referralBalance?.toFixed(2), agent: agent ? agent.level : 0, t1: resp.lv1, t2: resp.lv2, t3: resp.lv3, i1: referrals[0] ? referrals[0].amount : 0, i2: referrals[1] ? referrals[1].amount : 0, i3: referrals[2] ? referrals[0].amount : 0, withdrawals: withdrawals[0] ? withdrawals[0].amount : 0, deposits: deposits[0] ? deposits[0].amount : 0 })
        }

        return res.status(400).send({ success: false, error: 'User not exists' })
    } catch (error) {
        console.log(error)
    }
});


app.get('/crypto-deposit', async (req, res) => {
    try {
        var params2 = {
            currency_from: 'inr',
            currency_to: 'usdttrc20'
        }

        let resp2 = await NPApi.getMinimumPaymentAmount(params2)
        let min = resp2.min_amount

        var params = {
            price_amount: min,
            price_currency: 'inr',
            pay_currency: 'usdttrc20',
            ipn_callback_url: 'https://walrus-app-q9ypb.ondigitalocean.app/crypto-deposit-update',
            order_id: 'HATTDB-638922',
            order_description: 'Cashwin Deposit',
            is_fee_paid_by_user: true
        }

        let resp = await NPApi.createPayment(params)
        console.log(resp)
    } catch (error) {
        console.log('Error: ', error)
        res.send(error)
    }
})

app.post('/crypto-deposit-update', async (req, res) => {
    try {
        console.log('Status: \n', req.body)
    } catch (error) {
        console.log('Error: ', error)
    }
})