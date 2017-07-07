var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  log: 'info'
});

var indexName = 'doctors';


function indexExists() {
  return elasticClient.indices.exists({
    index: indexName
  });
}
exports.indexExists = indexExists;

function initIndex() {
  return elasticClient.indices.create({
    index: indexName
  });
}
exports.initIndex = initIndex;

function deleteIndex() {
  return elasticClient.indices.delete({
    index: indexName
  });
}
exports.deleteIndex = deleteIndex;

/* research init mapping */
function initMapping() {
  return elasticClient.indices.putMapping({
    index: indexName,
    type: 'doctor',
    body: {
      properties: {
        title: { type: 'keyword' },
        suggest: {
          type: 'completion',
          analyzer: 'simple',
          search_analyzer: 'simple',
          /*payloads: true*/
        }
      }
    }
  });
}
exports.initMapping = initMapping;

function addDoctor(doctorObj) {
  /* research index */
  return elasticClient.index({
    index: indexName,
    type: 'doctor',
    body: doctorObj
  }).then(function(result){
    return result;
  }).catch(function(error){
    return error;
  });
}
exports.addDoctor = addDoctor;

function getDoctor(name) {
  return elasticClient.search({
    index: indexName,
    type: 'doctor',
    body: {
      query : {
        bool : {
          must : [
            {match: {'profile.last_name' : name.last_name}},
            {match: {'profile.first_name' : name.first_name}}
          ]
        }
      }
    }
  })
}
exports.getDoctor = getDoctor;
