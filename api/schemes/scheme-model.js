const db = require('../../data/db-config');

async function find() { 
  const tasks = await db('schemes as sc')
    .leftJoin('steps as st', 'sc.scheme_id', '=', 'st.scheme_id')
    .select('sc.*')
    .count('st.step_id as number_of_steps')
    .groupBy('sc.scheme_id')
    .orderBy('sc.scheme_id')
  return tasks;  
}

async function findById(scheme_id) { 
  const rows = await db('schemes as sc')
    .leftJoin('steps as st', 'sc.scheme_id', '=', 'st.scheme_id')
    .select('sc.scheme_name', 'st.*', 'sc.scheme_id as id')
    .where('sc.scheme_id', scheme_id)
    .orderBy('st.step_number');
  const stepsMap = rows[0].step_id !== null ? rows.map(item => {
    return {
      step_id: item.step_id,
      step_number: item.step_number,
      instructions: item.instructions
    };
  }) : [];
  const result = {
    scheme_id: rows[0].scheme_id || rows[0].id,
    scheme_name: rows[0].scheme_name,
    steps: stepsMap
  };
  return result;
}


async function findSteps(scheme_id) { 
  const rows = await db('steps as st')
    .leftJoin('schemes as sc', 'sc.scheme_id', '=', 'st.scheme_id')
    .select('st.*', 'sc.scheme_name', 'sc.scheme_id as id')
    .where('sc.scheme_id', scheme_id)
    .orderBy('st.step_number');
  const result = rows.map(item => {
    return {
      step_id: item.step_id,
      step_number: item.step_number,
      instructions: item.instructions,
      scheme_name: item.scheme_name
    };
  });
  return result;
}

async function add(scheme) { 
  const [id] = await db('schemes').insert(scheme);
  return findById(id);
}

async function addStep(scheme_id, step) { 
  await db('steps')
    .insert({...step, scheme_id })
    .where('scheme_id', scheme_id);
  return findSteps(scheme_id);  
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
