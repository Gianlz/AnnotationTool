import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, IconButton, TextField, Button } from '@mui/material';
import { Add as AddIcon, MoreVert as MoreIcon, Close as CloseIcon } from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeContext';

// Types
type KanbanCard = {
  id: string;
  title: string;
  description?: string;
};

type KanbanColumn = {
  id: string;
  title: string;
  cards: KanbanCard[];
};

// Initial demo data
const initialColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'card-1', title: 'Research user requirements', description: 'Gather feedback from stakeholders' },
      { id: 'card-2', title: 'Create wireframes' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: 'card-3', title: 'Design system setup', description: 'Implement Nebula White theme' },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    cards: [],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: 'card-4', title: 'Project setup' },
    ],
  },
];

// --- Sub-components ---

type KanbanCardItemProps = {
  card: KanbanCard;
  onDelete: (cardId: string) => void;
};

const KanbanCardItem: React.FC<KanbanCardItemProps> = React.memo(({ card, onDelete }) => {
  const { mode } = useThemeContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 1,
        cursor: 'grab',
        border: 1,
        borderColor: mode === 'light' ? 'nebula.concrete' : 'nebula.steel',
        bgcolor: 'background.paper',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'light'
            ? '0 4px 8px rgba(0,0,0,0.08)'
            : '0 4px 8px rgba(0,0,0,0.3)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {isHovered && (
        <IconButton
          size="small"
          onClick={() => onDelete(card.id)}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            p: 0.25,
            color: 'text.secondary',
            '&:hover': {
              color: 'nebula.orange',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: 'text.primary',
          pr: isHovered ? 2 : 0,
        }}
      >
        {card.title}
      </Typography>
      {card.description && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            mt: 0.5,
            display: 'block',
          }}
        >
          {card.description}
        </Typography>
      )}
    </Paper>
  );
});
KanbanCardItem.displayName = 'KanbanCardItem';

type AddCardFormProps = {
  onAdd: (title: string) => void;
  onCancel: () => void;
};

const AddCardForm: React.FC<AddCardFormProps> = React.memo(({ onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  const { mode } = useThemeContext();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  }, [title, onAdd]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        autoFocus
        fullWidth
        size="small"
        placeholder="Enter card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            '& fieldset': {
              borderColor: mode === 'light' ? 'nebula.concrete' : 'nebula.steel',
            },
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          size="small"
          variant="contained"
          disabled={!title.trim()}
          sx={{
            bgcolor: 'nebula.black',
            color: 'nebula.white',
            '&:hover': {
              bgcolor: 'nebula.steel',
            },
          }}
        >
          Add Card
        </Button>
        <Button
          size="small"
          onClick={onCancel}
          sx={{
            color: 'text.secondary',
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
});
AddCardForm.displayName = 'AddCardForm';

type KanbanColumnComponentProps = {
  column: KanbanColumn;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
};

const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = React.memo(
  ({ column, onAddCard, onDeleteCard }) => {
    const { mode } = useThemeContext();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddCard = useCallback((title: string) => {
      onAddCard(column.id, title);
      setIsAdding(false);
    }, [column.id, onAddCard]);

    const handleDeleteCard = useCallback((cardId: string) => {
      onDeleteCard(column.id, cardId);
    }, [column.id, onDeleteCard]);

    return (
      <Box
        sx={{
          minWidth: 280,
          maxWidth: 280,
          height: 'fit-content',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: mode === 'light' ? 'nebula.concrete' : 'rgba(51, 51, 51, 0.5)',
            border: 1,
            borderColor: mode === 'light' ? 'nebula.concrete' : 'nebula.steel',
          }}
        >
          {/* Column Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
              px: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                }}
              >
                {column.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  bgcolor: mode === 'light' ? 'nebula.white' : 'nebula.steel',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 500,
                }}
              >
                {column.cards.length}
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Cards */}
          <Box
            sx={{
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: mode === 'light' ? 'nebula.steel' : 'nebula.concrete',
                borderRadius: 2,
              },
            }}
          >
            {column.cards.map((card) => (
              <KanbanCardItem key={card.id} card={card} onDelete={handleDeleteCard} />
            ))}
          </Box>

          {/* Add Card */}
          {isAdding ? (
            <AddCardForm onAdd={handleAddCard} onCancel={() => setIsAdding(false)} />
          ) : (
            <Button
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => setIsAdding(true)}
              sx={{
                mt: 1,
                justifyContent: 'flex-start',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                  color: 'text.primary',
                },
              }}
            >
              Add a card
            </Button>
          )}
        </Paper>
      </Box>
    );
  }
);
KanbanColumnComponent.displayName = 'KanbanColumnComponent';

// --- Main Component ---

export const KanbanView: React.FC = () => {
  const { mode } = useThemeContext();
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);

  const handleAddCard = useCallback((columnId: string, title: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: [
                ...col.cards,
                { id: `card-${Date.now()}`, title },
              ],
            }
          : col
      )
    );
  }, []);

  const handleDeleteCard = useCallback((columnId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((card) => card.id !== cardId) }
          : col
      )
    );
  }, []);

  const columnElements = useMemo(() => (
    columns.map((column) => (
      <KanbanColumnComponent
        key={column.id}
        column={column}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
      />
    ))
  ), [columns, handleAddCard, handleDeleteCard]);

  return (
    <Box
      id="kanban-view"
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: mode === 'light' ? 'nebula.concrete' : 'nebula.steel',
          ml: 6,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Kanban Board
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 0.5,
          }}
        >
          Organize and track your tasks
        </Typography>
      </Box>

      {/* Board */}
      <Box
        sx={{
          flex: 1,
          p: 3,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: mode === 'light' ? 'nebula.steel' : 'nebula.concrete',
            borderRadius: 4,
          },
        }}
      >
        {columnElements}

        {/* Add Column Button */}
        <Box sx={{ minWidth: 280 }}>
          <Button
            fullWidth
            startIcon={<AddIcon />}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 2,
              borderStyle: 'dashed',
              borderColor: mode === 'light' ? 'nebula.concrete' : 'nebula.steel',
              color: 'text.secondary',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'transparent',
              },
            }}
          >
            Add Column
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
