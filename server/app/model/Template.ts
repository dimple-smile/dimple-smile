import { Application } from 'egg'
// import * as uuid from 'uuid'

export default function (app: Application) {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const collection = 'Template'

  const Model = new Schema(
    {
      name: { type: String },
    },
    {
      collection,
    }
  )

  return mongoose.model(collection, Model)
}
