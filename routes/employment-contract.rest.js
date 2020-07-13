const responseHandler = require("../ResponseHandler");
const { checkAuthToken, checkRole } = require("../middleware/auth");
const ROLE = require("../constants/Role");
const errors = require("../errors");
const RESPONSE_MESSAGE = require("../constants/ResponseMessage");
const EmploymentContractService = require("../services/EmploymentContractService");
const employmentContractValidator = require("../middleware/validators").employmentContractValidator;

module.exports = (router) => {

  /**
   * @api {get} /employment-contract/:user_id/list Get Employment Contract List
   * @apiName Get Employment Contract List
   * @apiGroup Employment Contract
   * 
   * @apiParam (query) {String} page_no page number
   * @apiParam (query) {String} page_size records per page
   * 
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *          "status": "success",
   *          "message": "Successfully done",
   *          "data": {
   *                   "total": 1,
   *                    "records": [{
   *                         "id": "d41d5897-42db-4b0f-aab0-10b08b9b6b09",
   *                         "effective_date": "2020-05-23T00:00:00.000Z",
   *                         "expiry_date": "2021-06-12T00:00:00.000Z",
   *                         "status": "active",
   *                         "name": "newclub",
   *                         "club_academy_user_id": "7b2aae40-b92d-41c9-a1b5-84c0b20d9996",
   *                         "created_by": "player",
   *                         "can_update_status": true
   *                                }]
   *                  }
   *      }
   *     
   * @apiErrorExample {json} INTERNAL_SERVER_ERROR:
   *     HTTP/1.1 500 Internal server error
   *     {
   *       "message": "Internal Server Error",
   *       "code": "INTERNAL_SERVER_ERROR",
   *       "httpCode": 500
   *     }
   *  
   */
  router.get("/employment-contract/:user_id/list", checkAuthToken, (req, res, next) => {
    let paginationOptions = {
      page_no: (req.query && req.query.page_no) ? req.query.page_no : 1,
      limit: (req.query && req.query.page_size) ? Number(req.query.page_size) : 10
    };
    let user_id = req.params.user_id;
    let serviceInst = new EmploymentContractService();
    responseHandler(req, res, serviceInst.getEmploymentContractList({ user_id: user_id, role: req.authUser.role, paginationOptions }));
  });

  /**
   * @api {get} /employment-contract/:id Get Employment Contract
   * @apiName Get Employment Contract
   * @apiGroup Employment Contract
   * 
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *          "status": "success",
   *          "message": "Successfully done",
   *          "data": {
   *                   "club_academy_uses_agent_services": true,
   *                   "player_uses_agent_services": false,
   *                   "is_deleted": false,
   *                   "player_name": "Someone",
   *                   "club_academy_name": "Others",
   *                   "signing_date": "2020-06-15T00:00:00.000Z",
   *                   "effective_date": "2020-06-20T00:00:00.000Z",
   *                   "expiry_date": "2023-06-20T00:00:00.000Z",
   *                   "place_of_signature": "General Office",
   *                   "player_mobile_number": "7989875642",
   *                   "club_academy_representative_name": "Gopal",
   *                   "club_academy_address": "Near that road",
   *                   "club_academy_phone_number": "9898955662",
   *                   "club_academy_email": "userlessssclub@gmail.com",
   *                   "aiff_number": "asdas21312",
   *                   "crs_user_name": "CSRF_NAME",
   *                   "legal_guardian_name": "Gopal's Father",
   *                   "player_address": "near other road",
   *                   "player_email": "play@gmail.com",
   *                   "club_academy_intermediary_name": "something",
   *                   "club_academy_transfer_fee": "3423",
   *                   "status": "pending",
   *                   "sent_by": "f4ce1958-d318-4f92-9c72-b17bcaa93bcf",
   *                   "send_to": "704132f1-ddfc-4e82-95d0-d5fb3851fa41",
   *                   "id": "c0fdb242-c067-4369-afe4-67e7be5ce0ef",
   *                   "created_by": "club",
   *                   "send_to_category": "player"
   *                  }
   *      }
   *     
   * @apiErrorExample {json} INTERNAL_SERVER_ERROR:
   *     HTTP/1.1 500 Internal server error
   *     {
   *       "message": "Internal Server Error",
   *       "code": "INTERNAL_SERVER_ERROR",
   *       "httpCode": 500
   *     }
   *
   * @apiErrorExample {json} NOT_FOUND
   *     HTTP/1.1 404 Not found
   *     {
   *       "message": "Employment contract not found",
   *       "code": "NOT_FOUND",
   *       "httpCode": 404
   *     }
   * 
   * @apiErrorExample {json} VALIDATION_FAILED
	 *     HTTP/1.1 422 Validiation Failed
	 *     {
	 *       "message": "Not allowed to view employment contract",
   *       "code": "VALIDATION_FAILED",
   *       "httpCode": 422
	 *     }   
   *  
   */
  router.get("/employment-contract/:id", checkAuthToken, (req, res, next) => {
    let serviceInst = new EmploymentContractService();
    responseHandler(req, res, serviceInst.getEmploymentContractDetails({ id: req.params.id, user: req.authUser }));
  });

  /**
   * @api {put} /employment-contract/:id/status Update Employment Contract Status
   * @apiName Update Employment Contract Status
   * @apiGroup Employment Contract
   * 
   * @apiParam (body) {string} status Status enum : approved, disapproved
   * @apiParam (body) {string} [remarks] Status remarks (required if status = disapproved)
   * 
   * @apiSuccess {String} status success
   * @apiSuccess {String} message Successfully done
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *          "status": "success",
   *          "message": "Successfully done"
   *      }
   *     
   * @apiErrorExample {json} INTERNAL_SERVER_ERROR:
   *     HTTP/1.1 500 Internal server error
   *     {
   *       "message": "Internal Server Error",
   *       "code": "INTERNAL_SERVER_ERROR",
   *       "httpCode": 500
   *     }   
   *  
   */
  router.put("/employment-contract/:id/status", checkAuthToken, employmentContractValidator.UpdateStatusValidator, (req, res, next) => {
    let serviceInst = new EmploymentContractService();
    responseHandler(req, res, serviceInst.updateEmploymentContractStatus({ id: req.params.id, user: req.authUser, reqObj: req.body }));
  });
};
