async function updateFastParityPeriod(id) {
    try {
        let result = await getParityResult(id.toString()).then((response2) => {
            return response2
        });

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

        let newId = await getParityId().then((response) => {
            return response;
        });

        let updatePeriod = await fastParityModel.findOneAndUpdate({ id: id }, { $set: { winner: result } });
        let getPeriod = await fastParityModel.find().sort({ _id: -1 }).limit(26);
        const firstUpdate = await fastParityOrderModel.updateMany({ period: id }, { $set: { result: result } });
        const getFirstItems = await fastParityOrderModel.find({ period: id })

        let m = [];
        for (let i = 0; i < getFirstItems.length; i++) {
            let al;
            if (getFirstItems[i].selectType === 'color') {
                if (getFirstItems[i].select === resultInColor) {
                    al = getFirstItems[i].amount * 2
                    await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 2 } });
                } else {
                    if (getFirstItems[i].select === 'V' && isV) {
                        al = getFirstItems[i].amount * 4.5
                        await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 4.5 } });
                    }
                }
            } else {
                if (getFirstItems[i].selectType === 'number' && getFirstItems[i].select === result) {
                    al = getFirstItems[i].amount * 9
                    await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 9 } });
                }
            }

            let getD = await userModel.findOne({ id: getFirstItems[i].id })

            const fi = new financialModel({
                id: getFirstItems[i].id,
                title: 'Fast Parity Income',
                date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                amount: al,
                type: true,
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/FastParityIncome.png'
            })

            if (al) {
                fi.save()
            }

            let q = { id: getFirstItems[i].id, period: id, price: 19975.01, type: getFirstItems[i].selectType === 'color' ? true : false, select: getFirstItems[i].select, point: getFirstItems[i].amount, result }
            m.push(q)
        }

        const nData = new fastParityModel({
            id: newId.toString(),
            winner: '10'
        })

        if (getPeriod[25]) {
            await fastParityModel.deleteOne({ id: getPeriod[25].id })
        }

        nData.save()

        console.log(m)
        return { result: m, id: newId };
    } catch (error) {
        console.log(error)
    }
}



      <BrowserRouter>
        {user ? (
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/invite' element={<Invite />} />
            <Route path='/my' element={<My />} />
            <Route path='/recharge' element={<Recharge />} />
            <Route path='/recharge2' element={<RechargeScreen />} />
            <Route path='/task' element={<Task />} />
            <Route path='/check-in' element={<Checkin />} />
            <Route path='/withdraw' element={<Withdraw />} />
            <Route path='/agent-commission' element={<AgentIncome />} />
            <Route path='/daily-rec' element={<Commission />} />
            <Route path='/financial-records' element={<FinancialRecords />} />
            <Route path='/recharge-records' element={<RechargeRecords />} />
            <Route path='/team' element={<Team />} />
            <Route path='/game/fast-parity' element={<FastParity />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        ) : (
          <Routes>
            <Route path='*' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        )}
      </BrowserRouter>