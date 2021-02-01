const { init } = require('rajaongkir-node-js')
const request = init('93505ffaa86cce1750c819d993c9d430', 'starter')


module.exports = {
    getProvince: (req, res) => {
        const province = request.get('/province')
        province.then(prov => {
            let js = JSON.parse(prov)
            res.status(200).send(js.rajaongkir.results)
        })
    },
    getCity: (req, res) => { //ambil hanya semua nama kota
        const city = request.get('/city')
        city.then(kota => {
            let js = JSON.parse(kota)
            let listCity = []
            // js.rajaongkir.results.map((item) => {
            //     listCity.push({id:itme.id,city:item.city_name})
            // })
            res.status(200).send(js.rajaongkir.results)
        })
    },
    shippingCost: (req, res) => {
        const form = req.body;
        const data = {
            origin: form.origin,
            destination: form.destination,
            weight: form.weight,
            courier: form.courier // bisa merequest satu atau beberapa kurir sekaligus
        }
        // console.log(form)
        const cost = request.post('cost', data)
        cost.then(cst => {
            let cstN = JSON.parse(cst)
            let costPrice = cstN.rajaongkir.results[0].costs[1].cost[0].value //hanya ambil biaya
            // console.log(costPrice)
            return res.send({price:costPrice});
        })
    }
}