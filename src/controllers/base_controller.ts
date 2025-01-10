import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }
  async getAll(req: Request, res: Response) {
    const ownerFilter = req.query.owner;
    try {
      if (ownerFilter) {
        const posts = await this.model.find({ owner: ownerFilter });
        res.status(200).send(posts);
      } else {
        const posts = await this.model.find();
        res.status(200).send(posts);
      }
    } catch (error) {
      res.status(400).send(error);
    }
  };
  async getById(req: Request, res: Response) {
    const postId = req.params.id;
    try {
      const post = await this.model.findById(postId);
      if (post === null) {
        return res.status(404).send("not found");
      } else {
        return res.status(200).send(post);
      }
    } catch (error) {
      res.status(400).send(error);
    }
  };
  async create(req: Request, res: Response) {
    const item = req.body;
    try {
      const newItem = await this.model.create(item);
      res.status(201).send(newItem);
    } catch (error) {
      res.status(400).send(error);
    }
  };
  async deleteItem(req: Request, res: Response) {
    const itemId = req.params.id;
    try {
      await this.model.findByIdAndDelete(itemId);
      res.status(200).send();
    } catch (error) {
      res.status(400).send(error);
    }
  };
     
  async getByOwner (req: Request, res: Response) {
    const owner = req.query.owner;
    try {  
      if (!owner) {
        return res.status(400).send({ message: "Owner query parameter is required" });
      }
  
      const items = await this.model.find({ owner });
      res.status(200).send(items);
    } catch (error) {
      res.status(500).send( error );
    }
  };
  
  async updateItem(req: Request, res: Response) {
    const id = req.params.id;
    const updatedData = req.body;
    try {
      const updatedItem = await this.model.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!updatedItem) {
        return res.status(404).send({ message: "Item not found" });
      }
      res.status(200).send(updatedItem);
    } catch (error) {
      res.status(400).send(error);
    }
  }
};
export default BaseController;