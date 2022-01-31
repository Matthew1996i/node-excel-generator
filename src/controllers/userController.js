const xlsx = require('xlsx');
const path = require('path');

const User = require('../models/User');

async function exportExcel(data) {
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
  const workSheetData = [
    workSheetColumnNames,
    ...data,
  ];
  const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
  xlsx.utils.book_append_sheet(workbook, workSheet, workSheetName);
  xlsx.writeFile(workbook, path.resolve(filePath));
}

function exportUsersToExcel(users) {
  const data = users.map((user) => [
    user.dataValues.id,
    user.dataValues.firstname,
    user.dataValues.lastname,
    user.dataValues.email,
    user.dataValues.gender,
    user.dataValues.ipaddress,
  ]);
  const excel = exportExcel(data);
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
  // let totalData;

  // for (page; page < 2; page += 1) {
  //   totalData = User.findAndCountAll(
  //     paginate(
  //       {
  //         where: {},
  //       },
  //       { page, pageSize },
  //     ),
  //   );

  //   return totalData;
  // }

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

  // eslint-disable-next-line no-unused-vars
  const { totalPages } = await data;

  for (let i = 0; i <= 5; i += 1) {
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

  await exportUsersToExcel(dataExcel);

  return res.json('ok');
}

module.exports = {
  index,
  sendFullData,
};
