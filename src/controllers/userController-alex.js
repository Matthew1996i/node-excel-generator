const xlsx = require('xlsx');
const path = require('path');

const User = require('../models/User');

const chunk = (arr, len) => {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }
  return chunks;
};

async function exportExcel(data, totalPages) {
  const workSheetColumnNames = [
    'ID',
    'firstname',
    'lastname',
    'email',
    'gender',
    'ipaddress',
  ];
  const workSheetName = 'Users';
  const timestamp = Date.now();
  const filePath = (`/home/matheus/Documentos/report${timestamp}.xlsx`);
  const workbook = xlsx.utils.book_new();
  const arrChunk = chunk(data, 100000);
  let workSheet = xlsx.utils.aoa_to_sheet([workSheetColumnNames]);

  for (let i = 0; i < totalPages; i += 1) {
    workSheet = xlsx.utils.sheet_add_aoa(
      workSheet,
      arrChunk[i],
      { origin: -1 },
    );
  }
  xlsx.utils.book_append_sheet(workbook, workSheet, workSheetName);

  xlsx.writeFile(workbook, path.resolve(filePath), { bookSST: true, compression: true, bookType: 'xlsx' });
}

function exportUsersToExcel(users, totalPages) {
  const data = users.map((user) => [
    user.dataValues.id,
    user.dataValues.firstname,
    user.dataValues.lastname,
    user.dataValues.email,
    user.dataValues.gender,
    user.dataValues.ipaddress,
  ]);
  const excel = exportExcel(data, totalPages);
  return excel;
}

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
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    ...data.rows,
    totalItems,
    totalPages,
    page,
  };
}

async function index(req, res) {
  const page = 0;
  const pageSize = 1000;

  const data = await User.findAndCountAll(
    paginate(
      {
        where: {},
      },
      { page, pageSize },
    ),
  );

  const { count: totalItems } = data;
  const totalPages = Math.ceil(totalItems / pageSize);

  await exportUsersToExcel(data.rows);

  return res.json({
    totalItems,
    totalPages,
    page,
    message: 'finish!',
  });
  // return res.json({
  //   ...data.rows,
  //   totalItems,
  //   totalPages,
  //   page,
  // });
}

async function sendFullData(req, res) {
  const pageSize = 100000;
  const data = await appendData(0, pageSize);
  const results = [];
  const dataExcel = [];

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
    .then((values) => (values));

  await response.map((item) => dataExcel.push(...item.rows));

  // console.log(dataExcel[dataExcel.length - 2].length);

  await exportUsersToExcel(dataExcel, totalPages);

  return res.json('ok');
}

module.exports = {
  index,
  sendFullData,
};
