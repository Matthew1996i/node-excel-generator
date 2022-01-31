const path = require('path');
const XLSX = require('xlsx');
const XLSXWriter = require('xlsx-writestream');
const fs = require('fs');

const User = require('../models/User');

function paginate(query, { page, pageSize }) {
  const offset = page * pageSize;
  const limit = pageSize;

  return {
    ...query,
    offset,
    limit,
  };
}

async function appendData(page, pageSize) {
  const data = await User.findAndCountAll(
    paginate(
      {
        where: {},
      },
      { page, pageSize },
    ),
  );

  const { count: totalItems } = data;
  console.log(totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    ...data.rows,
    totalItems,
    totalPages,
    page,
  };
}

module.exports = {
  async excelJson(req, res) {
    const pageSize = 100000;
    const data = await appendData(0, pageSize);
    const results = [];
    const timestamp = Date.now();
    const filePath = (`/home/matheus/Documentos/report${timestamp}.xlsx`);

    const { totalPages } = await data;

    for (let i = 0; i <= totalPages; i += 1) {
      const page = parseInt(i, 10);

      const resp = User.findAndCountAll(
        paginate(
          {
            where: {},
          },
          { page, pageSize },
        ),
      );

      results.push(resp);
    }

    const response = await Promise.all(results)
      .then((values) => values);

    const workSheetColumnNames = [
      'id',
      'firstname',
      'lastname',
      'email',
      'gender',
      'ipaddress',
    ];

    const wb = XLSX.utils.book_new(); // create workbook
    await response.map((item, index) => {
      if (!item.rows) return null;

      const dataTable = item.rows.map((user) => ({
        id: user.dataValues.id,
        firstname: user.dataValues.firstname,
        lastname: user.dataValues.lastname,
        email: user.dataValues.email,
        gender: user.dataValues.gender,
        ipaddress: user.dataValues.ipaddress,
      }));

      const ws = XLSX.utils.json_to_sheet(dataTable, { header: workSheetColumnNames });
      return XLSX.utils.book_append_sheet(wb, ws, `users_sheet ${index + 1}`);
    });

    const wbOpts = { bookSST: true, compression: true, bookType: 'xlsx' }; // workbook options
    XLSX.writeFile(wb, path.resolve(filePath), wbOpts); // write workbook file

    console.log('OK');
    res.json('ok');
  },

  async stream(req, res) {
    const pageSize = 100000;
    const data = await appendData(0, pageSize);
    const results = [];
    const timestamp = Date.now();
    const filePath = (`/home/matheus/Documentos/report${timestamp}.xlsx`);

    const { totalPages } = await data;

    for (let i = 0; i <= totalPages; i += 1) {
      const page = parseInt(i, 10);

      const resp = User.findAndCountAll(
        paginate(
          {
            where: {},
          },
          { page, pageSize },
        ),
      );

      results.push(resp);
    }

    const response = await Promise.all(results)
      .then((values) => values);

    const writer = new XLSXWriter(filePath, { bookSST: true, compression: true, bookType: 'xlsx' });
    writer.getReadStream().pipe(fs.createWriteStream(filePath));

    await response.map((item) => {
      if (!item.rows) return null;

      return item.rows.map((user) => writer.addRow({
        id: user.dataValues.id,
        firstname: user.dataValues.firstname,
        lastname: user.dataValues.lastname,
        email: user.dataValues.email,
        gender: user.dataValues.gender,
        ipaddress: user.dataValues.ipaddress,
      }));
    });

    writer.finalize()
      .then(() => {
        console.log('OK');
        return res.json('ok');
      });
  },
};
