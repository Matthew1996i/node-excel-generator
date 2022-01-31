const Excel = require('exceljs');
// const path = require('path');

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
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet();

  worksheet.columns = [
    { header: 'Id', key: 'id' },
    { header: 'firstname', key: 'firstname' },
    { header: 'lastname.', key: 'lastname' },
    { header: 'email.', key: 'email' },
    { header: 'gender.', key: 'gender' },
    { header: 'ipaddress.', key: 'ipaddress' },
  ];

  console.log('create file');
  const arrChunk = chunk(data, 100000);
  for (let i = 0; i < totalPages; i += 1) {
    console.log(...arrChunk[i]);
  }

  workbook.xlsx
    .writeFile('newSaveeee.xlsx');

  console.log('created');

  console.log(arrChunk);
}

function exportUsersToExcel(users, totalPages) {
  const data = users.map((user) => ({
    id: user.dataValues.id,
    firstname: user.dataValues.firstname,
    lastname: user.dataValues.lastname,
    email: user.dataValues.email,
    gender: user.dataValues.gender,
    ipaddress: user.dataValues.ipaddress,
  }));
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

  for (let i = 0; i <= 3; i += 1) {
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
