const elastic = require('../../../../elasticsearch');
const { config } = require('../../../../config.js');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const timediff = require('timediff');

async function fetchDoctor(name){
  let result = {};
  try {
    let doctors = [];
    let resource_url = `https://api.betterdoctor.com/2016-03-01/doctors?name=${name.first_name}%20${name.last_name}&limit=10&user_key=${config.api_key}`;
    response = await axios.get(resource_url);
    if (response.data.meta.count){
      let promises = response.data.data.map(function(doctor){
        doctor.retrieveDate = (new Date()).toString();
        doctor.etag = response.headers.etag;
        doctors.push(doctor);
        return elastic.addDoctor(doctor);
      })
      await Promise.all(promises);
      result.doctors = doctors;
    }
  } catch (error){
      result.error = 'error, could not fech doctors';
  }
  return result;
}

router.get('/search', async function (req, res, next) {
  //is doctor data, not expired, etag still ok, then return from cache, else get from the API and return
  let index = await elastic.indexExists();
  index && await elastic.deleteIndex(index);
  await elastic.initIndex();
  await elastic.initMapping();
  if ( !req.query.name ){
    res.json({error: 'error, please provide a full (first and last) name'});
    return;
  }

  let name = req.query.name.split(' ')

  if (!name[1]){
    res.json({error: 'error, please provide a full (first and last) name'});
    return;
  }

  let nameObj = {last_name: name[1], first_name: name[0]};

  elastic.getDoctor( nameObj )
    .then(async function (result) {

      let expiredContent = result.hits.hits.filter(function(hit){
        let diff = timediff( (new Date()).toString(), hit._source.retrieveDate, 'YDHms');
        return diff.days > config.maxExpire;
      });

      //re-get data if it's expired
      if (result.hits.total && expiredContent.length === 0 ){
        res.json(result);
      } else {
        var doctors = await fetchDoctor(nameObj);
        res.json(doctors);
      }
    })
    .catch(function (error){
      res.send({error: error});
    });
});

module.exports = router;
