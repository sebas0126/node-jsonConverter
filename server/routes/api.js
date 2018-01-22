express = require("express");
router = express.Router();
var util = require("util");
var fs = require("fs");
var csv = require("csvtojson");

var js2xml = require("js2xmlparser");

multer = require('multer');

var upload = multer({
  dest: "./uploads/"
}).any();

router.post('/jsonToXml', upload, function (req, res) {
  var xml;
  if (req.files) {
    fs.readFile(req.files[0].path, "utf8", (err, data) => {
      xml = js2xml.parse("stablishment", JSON.parse(data));
      /* DESCARGAR */
      res.setHeader('Content-disposition', 'attachment; filename=myFile.xml');
      res.setHeader('Content-type', 'application/xml');
      res.write(xml, function (err) {
        res.end();
      });
      fs.unlinkSync(req.files[0].path);
    });
  }
});

router.post('/convertFile', upload, function (req, res) {
  if (req.files) {
    csv()
      .fromFile(req.files[0].path)
      .on("end_parsed", function (jsonArrayObj) {
        data = formatJson(jsonArrayObj);
        /* DESCARGAR */
        res.setHeader('Content-disposition', 'attachment; filename= myFile.json');
        res.setHeader('Content-type', 'application/json');
        res.write(data, function (err) {
          res.end();
        });
        fs.unlinkSync(req.files[0].path);
      })
  }
});

// replaceDiacritics = function (s) {
//   var r = s.toLowerCase();
//   r = r.replace(new RegExp(/á/g), "\u00e1");
//   r = r.replace(new RegExp(/é/g), "\u00e9");
//   r = r.replace(new RegExp(/í/g), "\u00ed");
//   r = r.replace(new RegExp(/ñ/g), "\u00f1");
//   r = r.replace(new RegExp(/ó/g), "\u00f3");
//   r = r.replace(new RegExp(/ú/g), "\u00fa");
//   return r;
// }

addArrayData = function (json, attrs, type) {
  var arr = [];
  if (type) {
    attrs.forEach(element => {
      obj = {};
      obj["name"] = json[element];
      arr.push(obj);
    });
  } else {
    attrs.forEach(element => {
      str = json[element];
      if (str) {
        arr.push(str);
      }
    });
  }
  return arr;
}

addCustomData = function (json, attrsIn, attrsOut, count) {
  var arr = [];
  for (var i = 0; i < count; i++) {
    var obj = {};
    for (var j = 0; j < attrsIn.length; j++) {
      var inField = attrsIn[j] + " " + (i + 1);
      obj[attrsOut[j]] = json[inField];
    }
    if (obj.address) {
      arr.push(obj);
    }
  }
  return arr;
}

formatJson = function (json) {
  var array = [];
  json.forEach(element => {
    if (!element["ID"]) return;
    var object = {
      id: element["ID"],
      name: element["Nombre restaurante"],
      timetable: element["Horario"],
      recommended: addArrayData(element, ["Recomendado 1", "Recomendado 2"], true),
      plans: addArrayData(element, ["Plan 1", "Plan 2", "Plan 3"], false),
      foodType: addArrayData(element, ["Tipo comida 1", "Tipo comida 2", "Tipo comida 3"], false),
      prices: element["Precios"],
      terms: element["Condiciones y restricciones"],
      url: {
        youtube: element["URL video youtube"],
        web: element["URL sitio web"]
      },
      img: {
        logo: element["Logo restaurante"],
        gallery: addArrayData(element, ["Foto grande 1", "Foto grande 2", "Foto grande 3", "Foto grande 4", "Foto grande 5"], false)
      },
      headquarters: addCustomData(
        element,
        ["Direccion sede", "Ciudad sede", "Zona Sede", "Telefono sede", "Horario sede", "Mapa Sede"],
        ["address", "city", "zone", "phone", "timetable", "map"],
        15
      ),
      description: element["Descripción"],
      curiosities: element["Curiosidades"],
      news: element["Descripción Novedad"]
    }
    array.push(object);
  });
  // console.log();
  return JSON.stringify(array);
}


module.exports = router;