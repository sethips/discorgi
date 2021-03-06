import { useContext, useState } from 'react';
import Modal from 'react-modal';
import ServerContext from '../../context/serverContext';
import { DELETE_SERVER, OPEN_MODAL } from '../../const';
import { useMutation, gql, useQuery } from '@apollo/client';
import { customStyles } from '../channels/CreateChannelForm';
import { useHistory, useParams } from 'react-router-dom';
import { SERVER_NAME_ROLE } from '../channels/Dropdown';

const DELETE_SERVER_MUTATION = gql`
  mutation DeleteServer($serverId: ID!) {
    deleteServer(serverId: $serverId) {
      id
    }
  }
`;

const LEAVE_SERVER_MUTATION = gql`
  mutation LeaveServer($serverId: ID!) {
    leaveServer(serverId: $serverId) {
      id
    }
  }
`;

const DeleteServer = () => {
  let nameRef;

  const { serverId } = useParams();
  const history = useHistory();

  const { data } = useQuery(SERVER_NAME_ROLE, {
    variables: { serverId },
  });

  const { openModal, dispatch } = useContext(ServerContext);

  const [isAlert, setAlert] = useState(false);

  const handleClose = () => {
    setAlert(false);
    dispatch({ type: OPEN_MODAL, payload: null });
  };

  const [deleteServer] = useMutation(DELETE_SERVER_MUTATION, {
    update(cache, { data: { deleteServer } }) {
      const serverToDelete = cache.identify(deleteServer);
      cache.evict({ id: serverToDelete });
      cache.gc();
    },
    onCompleted() {
      history.push('/channels/welcome/1');
    },
  });

  const [leaveServer] = useMutation(LEAVE_SERVER_MUTATION, {
    update(cache, { data: { leaveServer } }) {
      const serverToDelete = cache.identify(leaveServer);
      cache.evict({ id: serverToDelete });
      cache.gc();
    },
    onCompleted() {
      history.push('/channels/welcome/1');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.server.name === nameRef.value) {
      if (data.server.role === 'ADMIN') {
        deleteServer({
          variables: {
            serverId,
          },
        });
      } else {
        leaveServer({
          variables: {
            serverId,
          },
        });
      }
      setAlert(false);
      nameRef.value = '';
      history.push('/channels/welcome/1');
      dispatch({ type: OPEN_MODAL, payload: null });
    }
    setAlert(true);
  };

  return (
    <Modal
      isOpen={openModal === DELETE_SERVER}
      contentLabel='Delete server'
      style={customStyles}
    >
      {data && (
        <div className='delete-server-content'>
          <div style={{ padding: '20px' }}>
            <p className='close-button light' onClick={handleClose}>
              &#10006;
            </p>
            <h3 className='modal-title'>
              {data.server.role === 'ADMIN' ? 'Delete' : 'Leave'}{' '}
              <span style={{ color: '#7289da' }}>'{data.server.name}'</span>
            </h3>

            <div style={{ position: 'relative' }}>
              <div className='warning'>
                <p>
                  Are you sure you want to{' '}
                  {data.server.role === 'ADMIN' ? 'delete' : 'leave'}{' '}
                  <strong>{data.server.name}</strong>? This action cannot be
                  undone.
                </p>
              </div>

              <form id='delete-server' onSubmit={handleSubmit}>
                <label htmlFor='serverName'>ENTER SERVER NAME</label>
                <input
                  className='input-dark'
                  required
                  type='text'
                  name='serverName'
                  ref={(node) => (nameRef = node)}
                />
                {isAlert && (
                  <div className='alert'>
                    You didn't enter the server name correctly
                  </div>
                )}
              </form>
            </div>
          </div>
          <div className='buttons-wrapper'>
            <button className='button-cancel' onClick={handleClose}>
              Cancel
            </button>
            <button className='button-delete-server' form='delete-server'>
              {data.server.role === 'ADMIN' ? 'Delete' : 'Leave'} Server
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeleteServer;
