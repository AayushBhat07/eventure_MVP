import React from 'react';
import styled from 'styled-components';
import { Edit, Trash2, User } from 'lucide-react';

interface MemberCardProps {
  name: string;
  branch: string;
  phone: string;
  eventNames: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  branch,
  phone,
  eventNames,
  onEdit,
  onDelete
}) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="head">
          <User size={16} style={{ marginRight: '8px' }} />
          Team Member
        </div>
        <div className="content">
          <div className="member-info">
            <div className="info-row">
              <strong>Name:</strong> {name}
            </div>
            <div className="info-row">
              <strong>Branch:</strong> {branch}
            </div>
            <div className="info-row">
              <strong>Phone:</strong> {phone}
            </div>
            <div className="info-row">
              <strong>Events:</strong> 
              <div className="events-list">
                {eventNames.length > 0 ? (
                  eventNames.map((event, index) => (
                    <span key={index} className="event-tag">
                      {event}
                    </span>
                  ))
                ) : (
                  <span className="no-events">No events assigned</span>
                )}
              </div>
            </div>
          </div>
          <div className="button-group">
            {onEdit && (
              <button className="button edit-btn" onClick={onEdit}>
                <Edit size={14} />
                Edit
              </button>
            )}
            {onDelete && (
              <button className="button delete-btn" onClick={onDelete}>
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    font-family: 'Inter', sans-serif;
    width: 320px;
    min-height: 280px;
    translate: -6px -6px;
    background: #ff66a3;
    border: 3px solid #000000;
    box-shadow: 12px 12px 0 #000000;
    overflow: hidden;
    transition: all 0.3s ease;
    margin: 16px;
  }

  .head {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 900;
    width: 100%;
    height: 40px;
    background: #ffffff;
    padding: 8px 12px;
    color: #000000;
    border-bottom: 3px solid #000000;
    display: flex;
    align-items: center;
  }

  .content {
    padding: 16px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #000000;
  }

  .member-info {
    margin-bottom: 16px;
  }

  .info-row {
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .info-row strong {
    font-weight: 800;
    margin-right: 4px;
  }

  .events-list {
    margin-top: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .event-tag {
    background: #4ade80;
    padding: 2px 6px;
    border: 2px solid #000000;
    font-size: 11px;
    font-weight: 700;
    margin-right: 4px;
    margin-bottom: 4px;
  }

  .no-events {
    color: #666;
    font-style: italic;
    font-weight: 500;
  }

  .button-group {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .button {
    padding: 6px 12px;
    border: 3px solid #000000;
    box-shadow: 3px 3px 0 #000000;
    font-weight: 750;
    font-size: 12px;
    background: #4ade80;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .button:hover {
    translate: 1.5px 1.5px;
    box-shadow: 1.5px 1.5px 0 #000000;
  }

  .button:active {
    translate: 3px 3px;
    box-shadow: 0 0 0 #000000;
  }

  .edit-btn {
    background: #1ac2ff;
  }

  .edit-btn:hover {
    background: #0ea5e9;
  }

  .delete-btn {
    background: #ef4444;
  }

  .delete-btn:hover {
    background: #dc2626;
  }

  .card:hover {
    translate: -3px -3px;
    box-shadow: 15px 15px 0 #000000;
  }
`;

export default MemberCard;
