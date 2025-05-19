import React, { useState } from 'react'

const RejectStudentNoDuesModal = ({rejectAll}) => {

    const [rejectAllStudentModal,setRejectAllStudentModal] = useState(true);
  return (
    <>
     {/* Reject All Students Modal*/}
                <Modal
                  centered
                  show={rejectAllStudentModal}
                  onHide={() => setRejectAllStudentModal(false)}
                >
                  <div className="d-flex flex-column justify-content-center align-content-center m-5">
                    <h3>Confirm Deletion🥲</h3>
                    <p>Are you sure you want to Reject No Dues of All this Students ?</p>
                    <div className="d-flex gap-4">
                      <Button
                        variant="danger"
                        onClick={() => {
                          rejectAll();
                          setRejectAllStudentModal(false);
                        }}
                      >
                        Yes
                      </Button>
                      <Button onClick={() => setRejectAllStudentModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Modal>
    </>
  )
}

export default RejectStudentNoDuesModal