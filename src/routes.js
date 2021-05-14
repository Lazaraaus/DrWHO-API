"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");
        // compare function
        function compare(a, b) {
            // less than
            if (a.ordering < b.ordering){ return -1;}
            // greater than
            if (a.ordering > b.ordering){ return 1;}
            // equal
            return 0;
        }
        // already implemented:
        Doctor.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        // Get newDoctor object from request body
        let newDoctor = req.body;
        // Validate -> Name & Seasons required
        if (newDoctor.name == null || newDoctor.name == '' || newDoctor.seasons.length < 1) {
            // If Bad Data, send error
            let msg = "Bad data, check name and seasons"
            res.status(400).send(msg);
        }
        else {
            // Use convenience method to create Doctor
            Doctor.create(newDoctor).save()
            // After Object is created
            .then((result) => {
                // Send 201 Status Code and newly Created Doctor Object
                res.status(201).send(result);
            })
        }
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        // Mongoose Doctor.find
        Doctor.findById({_id:req.params.id})
        .then((result) => {
            // Return Result
            res.status(200).send(result);
        })
        .catch(err => {
            // Catch Error
            let msg = "Object with specified id wasn't found on this server";
            res.status(404).send(msg);
        })
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        // Get fieldObject
        let fieldObject = req.body;
        // Validate Fields
        for (let field in fieldObject) if (!fieldObject[field]) delete fieldObject[field]; // Delete fields from Object w/o specified value
        //Update fields
        Doctor.findOneAndUpdate({_id:req.params.id}, fieldObject, {new: true})  // Find Doctor by id & update fields in fieldObject
        .then(result => {
            // Return successfully updated Doctor Object
            res.status(200).send(result);
        })
        .catch(err => {
            // Return error
            res.status(404).send(err);
        })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findByIdAndDelete({_id:req.params.id})
        .then(result => {
            res.status(200).send();
        })
        .catch(err => {
            res.status(404).send(err);
        })
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        // Get all companions whose doctor field matches req.params.id
        Companion.find({doctors:req.params.id})
        .then(result => {
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(404).send(err);
        })
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        let bIsGoodParent = true;
        Companion.find({doctors:req.params.id})
        .then(result => {
            result.forEach(function (companion) {
                // Check all companions for alive status
                if (companion.alive === false) {
                    // If not alive, set flag to false 
                    bIsGoodParent = false;
                }
            })
            res.status(200).send(bIsGoodParent);
        })
        .catch(err => {
            res.status(404).send(err);
        })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        // Get newCompanion Object
        const newCompanion = req.body;
        // Validate newCompanion Object 
        if (newCompanion.name == null || newCompanion.name == '' || newCompanion.character == null || newCompanion.character == '' || newCompanion.alive == null){
            let msg = "Bad data, check name, character, or alive status and re-submit"   
            res.status(500).send(msg);
        }
        else {
            Companion.create(newCompanion).save()
            .then(result => {
                res.status(201).send(result);
            })
            .catch(err => {
                res.status(500).send(err);
            })
        }
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        // Find all Companions who:
        Companion.find({
            // Doctors object size is greater than 1
            doctors: { $not : { $size : 1}}
        })
        .then(result => {
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(404).send(err);
        })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        // Convenience method provided by Mongoose
        Companion.findById({_id:req.params.id})
        .then(result => {
            // Return Object and OK Status
            res.status(200).send(result);
        })
        .catch(err => {
            // Return err and NOT FOUND Status
            res.status(404).send(err);
        })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        // Get fieldObject
        let fieldObject = req.body;
        console.log(fieldObject);
        // Validate Fields
        for (let field in fieldObject) if (!fieldObject[field]) delete fieldObject[field]; // Delete fields from Object w/o specified value
        console.log(fieldObject);
        //Update fields
        Companion.findOneAndUpdate({_id:req.params.id}, fieldObject, {new: true})  // Find Companion by id & update fields in fieldObject
        .then(result => {
            // Return successfully updated Doctor Object
            console.log(result);
            res.status(200).send(result);
        })
        .catch(err => {
            // Return error
            res.status(404).send(err);
        })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findByIdAndDelete({_id:req.params.id})
        .then(result => {
            res.status(200).send()
        })
        .catch(err => {
            res.status(404).send(err);
        })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        // Get request Companion object
        Companion.findById({_id:req.params.id})
        .then(result => {
            // Get doctor field of Companion object
            let doctors = result.doctors;
            // Find all doctors who match the Ids
            Doctor.find({_id:doctors})
            .then(result=> {
                // Send to client
                res.status(200).send(result);
            })
            .catch(err => {
                // Catch Error
                res.status(404).send(err);
            })
        })
        .catch(err => {
            // Catch Error
            res.status(404).send(err);
        })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        // Get Companion Object
        Companion.findById({_id:req.params.id})
        .then(result => {
            // get Seasons field of requested Companion object
            let seasons_list = result.seasons;
            // Find all Companions who:
            Companion.find({
                // Has a season in the requested Companion object's season list
                seasons: {$in: seasons_list},
                // Is not the requested Companion
                _id: {$ne: req.params.id}
            })
            .then(result => {
                // Send to Client
                res.status(200).send(result);
            })
            .catch(err => {
                // Catch err
                res.status(404).send(err);
            })
        })
        .catch(err => {
            // Catch err
            res.status(404).send(err);
        })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;