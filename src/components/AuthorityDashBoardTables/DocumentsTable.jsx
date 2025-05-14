import { React, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import api from "../../api/axios";

const DocumentsTable = ({ authorityFromParent }) => {
  const [authority, setAuthority] = useState(authorityFromParent);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    if (authority) {
      fetchAllStudentsByAuthority(authority.id);
    }
  }, []);

  //view Documents
  const [viewStudentDocuments, setViewStudentDocuments] = useState(false);
  const [studentDocuments, setStudentDocuments] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteAllDocumentsModal,setDeleteAllDocumentsModal] = useState(false);

  //fetchAllDocumentsByAuthority
  const fetchAllStudentsByAuthority = async (id) => {
    try {
      const response = await api.get(
        `/file/getAllStudentsByAuthority/${id}`
      );

      if (response.status === 200 && response.data) {
        setAllStudents(response.data);
        console.log(response.data);
      }
    } catch (error) {
      toast.error("Error while fetching documents");
      console.log(error);
    }
  };

  // get selected student documents
  const getSelectedStudentDocuments = async (student) => {
    try {
      const response = await api.get(
        `/file/getStudentDocuments/${authority.id}/${student.id}`,
        {
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );
      if (response.status === 404) {
        toast.info(student.studentName + " Not upload any document yet");
      } else if (response.status === 200 && response.data) {
        setSelectedStudent(student);
        setViewStudentDocuments(true);
        setStudentDocuments(response.data);
        // console.log(response.data);
      }
    } catch (error) {
      toast.error("Error while fetching documents");
      console.log("Error while fetching students", error);
      // }
    }
  };

  //Delete Selected student All Documents
  const deleteAllDocumentsByStudent = async (studentId, authorityId) => {
    try {
      console.log(studentId + " " + authorityId);
      const response = await api.delete(
        `/file/deleteByStudentId/${studentId}/${authorityId}`
      );

      if (response.status === 200 && response.data) {
        setStudentDocuments([]);
        toast.success("Documents deleted successfully");
      } else if (response.status === 404) {
        toast.warn("Their is no files remaining");
      }

      console.log(response);
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  };

  //deleteAllDocuments
  const deleteAllDocuments = async () =>{

    try {
      const response = await api.delete("/deleteAllDocuments");
      if (response.data) {
        setAllStudents([]);
        toast.success("All Students Documents deleted successfully");
      } else{
        toast.warn("Their is no Documents remaining");
      }

      console.log(response);
    } catch (error) {
      toast.error("Error while deleting all students documents"+error);
      console.log(error);
    }
  }

  return (
    <>
      <div className="pending-request mt-4 mb-1 ms-4 me-1">
        <div className="d-flex gap-lg-3 gap-sm-2 align-items-center justify-content-between">
          <div className="d-flex gap-lg-4 gap-sm-1 align-items-center">
            <h2>Documents </h2>
          </div>
          <div className="d-flex me-lg-3  gap-3">
            <button
              className="btn btn-danger me-lg-5 me-sm-0"
                onClick={() => deleteAllDocuments }
            >
              Delete All
            </button>
          </div>
        </div>
      </div>

      <table className="table table-bordered table-dark">
        <thead>
          <tr>
            <th scope="col">S No.</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Documents</th>
          </tr>
        </thead>
        <tbody>
          {allStudents.map((student, index) => (
            <tr>
                <td>{index+1}</td>
                <td>{student.studentName}</td>
                <td>{student.email}</td>
                <td>
                    <button className="btn btn-primary" 
                           onClick={() => getSelectedStudentDocuments(student)}
                    >View</button>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
      {/* Document View Modal */}
      <Modal
        show={viewStudentDocuments}
        onHide={() => setViewStudentDocuments(false)}
        centered
      >
        <Modal.Header closeButton>
          <h3 className="text-center">
            {selectedStudent ? selectedStudent.studentName : "Loading..."}
          </h3>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column gap-3">
            {studentDocuments
              ? studentDocuments.map((studentDocument, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <h5>
                      {studentDocument
                        ? studentDocument.fileDescription
                        : "Loading..."}
                    </h5>
                    <div className="d-flex gap-3">
                      <button
                        className="btn btn-primary me-3"
                        onClick={() =>
                          window.open(studentDocument.url, "_black")
                        }
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              : "loading...."}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              deleteAllDocumentsByStudent(selectedStudent.id, authority.id);
              setViewStudentDocuments(false);
            }}
          >
            Delete All
          </Button>
          <Button
            variant="secondary"
            onClick={() => setViewStudentDocuments(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete All Documents Modal*/}
              <Modal
                centered
                show={deleteAllDocumentsModal}
                onHide={() => setDeleteAllDocumentsModal(false)}
              >
                <div className="d-flex flex-column justify-content-center align-content-center m-5">
                  <Modal.Header>Confirm Deletion 🥲</Modal.Header>
                  <Modal.Body>Are you sure you want to delete All  Students Documents ?</Modal.Body>
                  <div className="d-flex gap-4">
                    <Button
                      variant="danger"
                      onClick={() => {
                        deleteAllDocuments();
                        setDeleteAllDocumentsModal(false);
                      }}
                    >
                      Yes
                    </Button>
                    <Button onClick={() => setDeleteAllDocumentsModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Modal>
    </>
  );
};

export default DocumentsTable;
